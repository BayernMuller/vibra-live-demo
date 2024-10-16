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
    await audioContext.audioWorklet.addModule('https://bayernmuller.github.io/vibra-live-demo/public/recorderProcessor.js');
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
      // get https://vercel-proxy-rust-three.vercel.app/api/shazam?uri= and samplems=
      fetch(`https://vercel-proxy-rust-three.vercel.app/api/shazam?uri=${signature.uri}&samplems=${signature.samplems}`)
        .then(response => response.json())
        .then(data => {
          document.getElementById('result').textContent = JSON.stringify(data);
        });
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