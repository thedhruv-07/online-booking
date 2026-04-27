export const samplingPlanTable = {
  A: {
    sampleSize: 2,
    aql: {
      "1.0": { accept: 0, reject: 1 },
      "1.5": { accept: 0, reject: 1 },
      "2.5": { accept: 0, reject: 1 },
      "4.0": { accept: 0, reject: 1 },
      "6.5": { accept: 0, reject: 1 },
    }
  },
  B: {
    sampleSize: 3,
    aql: {
      "1.0": { accept: 0, reject: 1 },
      "1.5": { accept: 0, reject: 1 },
      "2.5": { accept: 0, reject: 1 },
      "4.0": { accept: 0, reject: 1 },
      "6.5": { accept: 1, reject: 2 },
    }
  },
  C: {
    sampleSize: 5,
    aql: {
      "1.0": { accept: 0, reject: 1 },
      "1.5": { accept: 0, reject: 1 },
      "2.5": { accept: 0, reject: 1 },
      "4.0": { accept: 0, reject: 1 },
      "6.5": { accept: 1, reject: 2 },
    }
  },
  D: {
    sampleSize: 8,
    aql: {
      "1.0": { accept: 0, reject: 1 },
      "1.5": { accept: 0, reject: 1 },
      "2.5": { accept: 0, reject: 1 },
      "4.0": { accept: 1, reject: 2 },
      "6.5": { accept: 1, reject: 2 },
    }
  },
  E: {
    sampleSize: 13,
    aql: {
      "1.0": { accept: 0, reject: 1 },
      "1.5": { accept: 0, reject: 1 },
      "2.5": { accept: 1, reject: 2 },
      "4.0": { accept: 1, reject: 2 },
      "6.5": { accept: 2, reject: 3 },
    }
  },
  F: {
    sampleSize: 20,
    aql: {
      "1.0": { accept: 0, reject: 1 },
      "1.5": { accept: 1, reject: 2 },
      "2.5": { accept: 1, reject: 2 },
      "4.0": { accept: 2, reject: 3 },
      "6.5": { accept: 3, reject: 4 },
    }
  },
  G: {
    sampleSize: 32,
    aql: {
      "1.0": { accept: 1, reject: 2 },
      "1.5": { accept: 1, reject: 2 },
      "2.5": { accept: 2, reject: 3 },
      "4.0": { accept: 3, reject: 4 },
      "6.5": { accept: 5, reject: 6 },
    }
  },
  H: {
    sampleSize: 50,
    aql: {
      "1.0": { accept: 1, reject: 2 },
      "1.5": { accept: 2, reject: 3 },
      "2.5": { accept: 3, reject: 4 },
      "4.0": { accept: 5, reject: 6 },
      "6.5": { accept: 7, reject: 8 },
    }
  },
  J: {
    sampleSize: 80,
    aql: {
      "1.0": { accept: 2, reject: 3 },
      "1.5": { accept: 3, reject: 4 },
      "2.5": { accept: 5, reject: 6 },
      "4.0": { accept: 7, reject: 8 },
      "6.5": { accept: 10, reject: 11 },
    }
  },
  K: {
    sampleSize: 125,
    aql: {
      "1.0": { accept: 3, reject: 4 },
      "1.5": { accept: 5, reject: 6 },
      "2.5": { accept: 7, reject: 8 },
      "4.0": { accept: 10, reject: 11 },
      "6.5": { accept: 14, reject: 15 },
    }
  },
  L: {
    sampleSize: 200,
    aql: {
      "1.0": { accept: 5, reject: 6 },
      "1.5": { accept: 7, reject: 8 },
      "2.5": { accept: 10, reject: 11 },
      "4.0": { accept: 14, reject: 15 },
      "6.5": { accept: 21, reject: 22 },
    }
  },
  M: {
    sampleSize: 315,
    aql: {
      "1.0": { accept: 7, reject: 8 },
      "1.5": { accept: 10, reject: 11 },
      "2.5": { accept: 14, reject: 15 },
      "4.0": { accept: 21, reject: 22 },
      "6.5": { accept: 21, reject: 22 },
    }
  },
  N: {
    sampleSize: 500,
    aql: {
      "1.0": { accept: 10, reject: 11 },
      "1.5": { accept: 14, reject: 15 },
      "2.5": { accept: 21, reject: 22 },
      "4.0": { accept: 21, reject: 22 },
      "6.5": { accept: 21, reject: 22 },
    }
  },
  P: {
    sampleSize: 800,
    aql: {
      "1.0": { accept: 14, reject: 15 },
      "1.5": { accept: 21, reject: 22 },
      "2.5": { accept: 21, reject: 22 },
      "4.0": { accept: 21, reject: 22 },
      "6.5": { accept: 21, reject: 22 },
    }
  },
  Q: {
    sampleSize: 1250,
    aql: {
      "1.0": { accept: 21, reject: 22 },
      "1.5": { accept: 21, reject: 22 },
      "2.5": { accept: 21, reject: 22 },
      "4.0": { accept: 21, reject: 22 },
      "6.5": { accept: 21, reject: 22 },
    }
  },
  R: {
    sampleSize: 2000,
    aql: {
      "1.0": { accept: 21, reject: 22 },
      "1.5": { accept: 21, reject: 22 },
      "2.5": { accept: 21, reject: 22 },
      "4.0": { accept: 21, reject: 22 },
      "6.5": { accept: 21, reject: 22 },
    }
  }
};
