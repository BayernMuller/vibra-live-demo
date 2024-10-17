async function getPcmSignature(rawpcm, pcm_size, sampleRate, sampleWidth, channelCount) {
  const dataPtr = Module._malloc(pcm_size);
  Module.HEAPU8.set(rawpcm, dataPtr);
  const signaturePtr = Module.ccall(
      'GetPcmSignature',
      'number',
      ['number', 'number', 'number', 'number', 'number'],
      [dataPtr, pcm_size, sampleRate, sampleWidth, channelCount]
  );
  Module._free(dataPtr);

  const uri = Module.ccall('GetFingerprint', 'string', ['number'], [signaturePtr]);
  const samplems = Module.ccall('GetSampleMs', 'number', ['number'], [signaturePtr]);

  return {
    uri: uri,
    samplems: samplems
  }
}

function recognizeSuccess(album, title, artist, cover) {
  document.getElementById('album').textContent = album;
  document.getElementById('title').textContent = title;
  document.getElementById('artist').textContent = artist;
  document.getElementById('cover').src = cover;

  const trackContainer = document.getElementById('track-container');
  trackContainer.style.display = 'flex';

  const titleContent = document.getElementById('title-content');
  titleContent.style.display = 'none';

  const centerContent = document.getElementById('center-content');
  centerContent.style.display = 'none';

  const errorMessage = document.getElementById('error-message');
  errorMessage.style.display = 'none';
}

function recognizeFailed(error) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = error;
  errorMessage.style.display = 'block';
}

(async () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  let audioContext;
  let recorderNode;
  let recordedChunks = [];

  startBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    const sourceNode = audioContext.createMediaStreamSource(stream);
    await audioContext.audioWorklet.addModule('public/recorderProcessor.js');
    recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');
    recorderNode.port.onmessage = event => {
      const audioChunk = event.data;
      recordedChunks.push(audioChunk);
    };
    sourceNode.connect(recorderNode).connect(audioContext.destination);
    startBtn.disabled = true;
    stopBtn.disabled = false;
    console.log('녹음 시작...');

    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
  };

  stopBtn.onclick = () => {
    console.log('녹음 종료 및 저장...');
    
    recorderNode.disconnect();
    audioContext.close();
    
    let audioBuffer = mergeBuffers(recordedChunks);
    const buffer_byte_length = audioBuffer.length * audioBuffer.BYTES_PER_ELEMENT;
    
    let signature;

    getPcmSignature(audioBuffer, buffer_byte_length, 44100, 32, 1)
      .then(sig => {
        signature = sig;
        return fetch(`https://vercel-proxy-rust-three.vercel.app/api/shazam?uri=${signature.uri}&samplems=${signature.samplems}`);
      })
      .then(response => response.json())
      .then(data => {
        if (data.retryms) {
          if (data.retryms > 8000) {
            recognizeFailed(`Please record song clearly and try again.`);
          } else {
            recognizeFailed(`${signature.samplems / 1000} seconds was too short for recognition. Try to record for ${data.retryms / 1000} seconds.`);
          }
          return;
        }

        const track = data.track || {};
        const sections = track.sections || [];
        const metadata = sections[0]?.metadata || [];
        const album = metadata[0]?.text;
        const title = track.title;
        const artist = track.subtitle;
        const cover = track.images?.coverart;

        if (album && title && artist && cover) {
          recognizeSuccess(album, title, artist, cover);
        } else {
          recognizeFailed("Please reduce the surrounding noise and try again");
        }
      })
      .catch(error => {
        console.log(error);
        recognizeFailed(error.message);
      });

    startBtn.disabled = false;
    stopBtn.disabled = true;
    recordedChunks = [];
  };

  function mergeBuffers(buffers){
    let length = buffers.reduce((total, buffer) => total + buffer.length, 0);
    let result = new Float32Array(length);
    let offset = 0;
    buffers.forEach(buffer => {
      result.set(buffer, offset);
      offset += buffer.length;
    });
    return new Uint8Array(result.buffer);
  }
})();