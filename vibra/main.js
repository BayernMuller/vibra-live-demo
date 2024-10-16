// Module.onRuntimeInitialized = () => {
//   document.getElementById('fileInput').disabled = false;
// };

// Fingerprint* EMSCRIPTEN_KEEPALIVE GetWavSignature(char* raw_wav, int wav_data_size)
async function getSignature(rawwav) {
  const dataPtr = Module._malloc(rawwav.length);
  Module.HEAPU8.set(rawwav, dataPtr);
  const signaturePtr = Module.ccall(
      'GetWavSignature',
      'number',
      ['number', 'number'],
      [dataPtr, rawwav.length]
  );
  Module._free(dataPtr);

  const uri = Module.ccall('GetFingerprint', 'string', ['number'], [signaturePtr]);
  const samplems = Module.ccall('GetSampleMs', 'number', ['number'], [signaturePtr]);

  return {
      uri: uri,
      samplems: samplems
  }
}

// Fingerprint* EMSCRIPTEN_KEEPALIVE GetPcmSignature(char* raw_pcm, int pcm_data_size, int sample_rate, int sample_width, int channel_count)
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
    await audioContext.audioWorklet.addModule('https://bayernmuller.github.io/vibra/recorderProcessor.js');
    recorderNode = new AudioWorkletNode(audioContext, 'recorder-processor');
    recorderNode.port.onmessage = event => {
      const audioChunk = event.data;
      recordedChunks.push(audioChunk);
    };
    sourceNode.connect(recorderNode).connect(audioContext.destination);
    startBtn.disabled = true;
    stopBtn.disabled = false;
    console.log('녹음 시작...');
  };

  stopBtn.onclick = () => {
    console.log('녹음 종료 및 저장...');
    
    recorderNode.disconnect();
    audioContext.close();
    
    let audioBuffer = mergeBuffers(recordedChunks);
    const buffer_byte_length = audioBuffer.length * audioBuffer.BYTES_PER_ELEMENT;
    
    getPcmSignature(audioBuffer, buffer_byte_length, 44100, 32, 1).then(signature => {
      navigator.clipboard.writeText(signature.uri)
      console.log(signature.uri);
    
      document.getElementById('result').innerText = signature.uri;
      document.getElementById('samplems').innerText = signature.samplems;

      return recognize(signature);
    }).then(json => {
      console.log(json);
      document.getElementById('json').innerText = JSON.stringify(json, null, 2);
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

    // Uint8Array로 변환
    return new Uint8Array(result.buffer);
  }
})();