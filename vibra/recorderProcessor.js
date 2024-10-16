class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      // 오디오 데이터를 메인 스레드로 전달
      this.port.postMessage(channelData.slice());
    }
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);