import { TransactionPeriod } from "src/transaction/dto/create-transaction.dto";

export function getPeriodDates(period?: TransactionPeriod) {
  if (!period) {
    return undefined;
  }

  const now = new Date();

  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case TransactionPeriod.DAILY: {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      break;
    }

    case TransactionPeriod.WEEKLY: {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now);
      endDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 1);

      break;
    }

    case TransactionPeriod.MONTHLY: {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      );

      break;
    }
  }

  return {
    startDate,
    endDate,
  };
}