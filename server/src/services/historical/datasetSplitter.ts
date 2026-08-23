import { DatasetSplitStats, DatasetSplitType } from '../../../../shared/types/index.js';

export interface SplitResult<T> {
  train: T[];
  val: T[];
  test: T[];
  stats: DatasetSplitStats;
}

export class DatasetSplitter {
  /**
   * Chronological split: older 70% -> TRAIN, middle 15% -> VAL, latest 15% -> TEST.
   */
  splitChronological<T extends { observedAt: string }>(
    items: T[],
    trainRatio = 0.7,
    valRatio = 0.15
  ): SplitResult<T> {
    if (items.length === 0) {
      return {
        train: [],
        val: [],
        test: [],
        stats: {
          trainCount: 0,
          valCount: 0,
          testCount: 0,
          trainStartDate: '',
          trainEndDate: '',
          valStartDate: '',
          valEndDate: '',
          testStartDate: '',
          testEndDate: '',
        },
      };
    }

    // Ensure strictly chronological
    const sorted = [...items].sort(
      (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
    );

    const total = sorted.length;
    const trainEndIdx = Math.floor(total * trainRatio);
    const valEndIdx = Math.floor(total * (trainRatio + valRatio));

    const train = sorted.slice(0, trainEndIdx);
    const val = sorted.slice(trainEndIdx, valEndIdx);
    const test = sorted.slice(valEndIdx);

    const stats: DatasetSplitStats = {
      trainCount: train.length,
      valCount: val.length,
      testCount: test.length,
      trainStartDate: train.length > 0 ? train[0].observedAt : '',
      trainEndDate: train.length > 0 ? train[train.length - 1].observedAt : '',
      valStartDate: val.length > 0 ? val[0].observedAt : '',
      valEndDate: val.length > 0 ? val[val.length - 1].observedAt : '',
      testStartDate: test.length > 0 ? test[0].observedAt : '',
      testEndDate: test.length > 0 ? test[test.length - 1].observedAt : '',
    };

    return {
      train,
      val,
      test,
      stats,
    };
  }

  getSplitTypeForIndex(index: number, total: number, trainRatio = 0.7, valRatio = 0.15): DatasetSplitType {
    const trainEnd = Math.floor(total * trainRatio);
    const valEnd = Math.floor(total * (trainRatio + valRatio));

    if (index < trainEnd) return 'TRAIN';
    if (index < valEnd) return 'VAL';
    return 'TEST';
  }
}

export const datasetSplitter = new DatasetSplitter();
