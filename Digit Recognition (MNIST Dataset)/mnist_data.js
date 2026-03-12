// Official MNIST loader adapted from tfjs examples

class MnistData {
  constructor() {
    this.SHUFFLE_SEED = 42;
    this.IMAGE_SIZE = 784;
    this.NUM_CLASSES = 10;
    this.NUM_DATASET_ELEMENTS = 65000;

    this.NUM_TRAIN_ELEMENTS = 55000;
    this.NUM_TEST_ELEMENTS = this.NUM_DATASET_ELEMENTS - this.NUM_TRAIN_ELEMENTS;

    this.MNIST_IMAGES_SPRITE_PATH =
      "https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png";
    this.MNIST_LABELS_PATH =
      "https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8";
  }

  async load() {
    // Load the images
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const imgRequest = new Promise((resolve) => {
      img.crossOrigin = "";
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer = new ArrayBuffer(this.NUM_DATASET_ELEMENTS * this.IMAGE_SIZE * 4);

        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < this.NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * this.IMAGE_SIZE * chunkSize * 4,
            this.IMAGE_SIZE * chunkSize
          );
          ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let j = 0; j < imageData.data.length / 4; j++) {
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);
        resolve();
      };
      img.src = this.MNIST_IMAGES_SPRITE_PATH;
    });

    // Load the labels
    const labelsRequest = fetch(this.MNIST_LABELS_PATH);
    const [_, labelsResponse] = await Promise.all([imgRequest, labelsRequest]);

    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

    // Create shuffled indices
    this.trainIndices = tf.util.createShuffledIndices(this.NUM_TRAIN_ELEMENTS);
    this.testIndices = tf.util.createShuffledIndices(this.NUM_TEST_ELEMENTS);

    // Slice train and test data
    this.trainImages = this.datasetImages.slice(0, this.IMAGE_SIZE * this.NUM_TRAIN_ELEMENTS);
    this.testImages = this.datasetImages.slice(this.IMAGE_SIZE * this.NUM_TRAIN_ELEMENTS);

    this.trainLabels = this.datasetLabels.slice(0, this.NUM_CLASSES * this.NUM_TRAIN_ELEMENTS);
    this.testLabels = this.datasetLabels.slice(this.NUM_CLASSES * this.NUM_TRAIN_ELEMENTS);

    this.trainIndex = 0;
    this.testIndex = 0;
  }

  nextTrainBatch(batchSize) {
    return this.nextBatch(batchSize, [this.trainImages, this.trainLabels], () => {
      this.trainIndex = (this.trainIndex + 1) % this.trainIndices.length;
      return this.trainIndices[this.trainIndex];
    });
  }

  nextTestBatch(batchSize) {
    return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.testIndex = (this.testIndex + 1) % this.testIndices.length;
      return this.testIndices[this.testIndex];
    });
  }

  nextBatch(batchSize, data, indexFn) {
    const batchImagesArray = new Float32Array(batchSize * this.IMAGE_SIZE);
    const batchLabelsArray = new Uint8Array(batchSize * this.NUM_CLASSES);

    for (let i = 0; i < batchSize; i++) {
      const idx = indexFn();
      const image = data[0].slice(idx * this.IMAGE_SIZE, idx * this.IMAGE_SIZE + this.IMAGE_SIZE);
      batchImagesArray.set(image, i * this.IMAGE_SIZE);

      const label = data[1].slice(idx * this.NUM_CLASSES, idx * this.NUM_CLASSES + this.NUM_CLASSES);
      batchLabelsArray.set(label, i * this.NUM_CLASSES);
    }

    const xs = tf.tensor2d(batchImagesArray, [batchSize, this.IMAGE_SIZE]).reshape([batchSize, 28, 28, 1]);
    const labels = tf.tensor2d(batchLabelsArray, [batchSize, this.NUM_CLASSES]);

    return { xs, labels };
  }
}