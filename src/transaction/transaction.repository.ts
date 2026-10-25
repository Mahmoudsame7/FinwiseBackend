import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction, TransactionType } from "./entities/transaction.entity";
import { Repository } from "typeorm";
import { GetTransactionDto, SearchTransactionsDto } from "./dto/create-transaction.dto";
import { getPeriodDates } from "../Utilities/Helpers/HelperFunctions";

@Injectable()
export class TransactionRepository {
  constructor(@InjectRepository(Transaction) private readonly repository: Repository<Transaction>) { }

  async findOne(userId: string, transactionId: string): Promise<Transaction | null> {
    return this.repository.findOne({
      where: {
        id: transactionId,
        account: {
          userId
        }
      },
      relations: {
        account: true,
      },
    })
  }

  async findAllPeriodSummary(userId: string) {
    const query = `
                    SELECT
            EXTRACT(
                YEAR FROM (
                t."transactionTime" AT TIME ZONE 'Africa/Cairo'
                )
            ) AS year,

            COALESCE(SUM(t.amount), 0) AS total,

            COALESCE(
                SUM(t.amount) FILTER (WHERE t.type = 'income'),
                0
            ) AS total_income,

            COALESCE(
                SUM(t.amount) FILTER (WHERE t.type = 'expense'),
                0
            ) AS total_expense,

           SUM(
        COALESCE(
          SUM(t.amount) FILTER (
            WHERE t.type = 'income'
          ),
          0
        )
      ) OVER () AS period_total_income,

      SUM(
        COALESCE(
          SUM(t.amount) FILTER (
            WHERE t.type = 'expense'
          ),
          0
        )
      ) OVER () AS period_total_expense

            FROM accounts a

            LEFT JOIN transactions t
            ON t."accountId" = a.id

            WHERE a."userId" = $1

            GROUP BY
            EXTRACT(
                YEAR FROM (
                t."transactionTime" AT TIME ZONE 'Africa/Cairo'
                )
            )

            ORDER BY year ASC;
        `
    return this.repository.query(query, [userId]);
  }

  async findYearPeriodSummary(userId: string) {

    const query = `
    WITH months AS (
      SELECT
        month_start::date AS month_start,

        (
          month_start
          + INTERVAL '1 month'
          - INTERVAL '1 day'
        )::date AS month_end

      FROM generate_series(
        DATE_TRUNC('year', CURRENT_DATE),
        DATE_TRUNC('year', CURRENT_DATE)
          + INTERVAL '11 months',
        INTERVAL '1 month'
      ) AS month_start
    )

    SELECT
      m.month_start,
      m.month_end,

      TO_CHAR(m.month_start, 'Month') AS month_name,

      COALESCE(SUM(t.amount), 0) AS total,

      COALESCE(
        SUM(t.amount) FILTER (
          WHERE t.type = 'income'
        ),
        0
      ) AS total_income,

      COALESCE(
        SUM(t.amount) FILTER (
          WHERE t.type = 'expense'
        ),
        0
      ) AS total_expense,

      SUM(
        COALESCE(
          SUM(t.amount) FILTER (
            WHERE t.type = 'income'
          ),
          0
        )
      ) OVER () AS period_total_income,

      SUM(
        COALESCE(
          SUM(t.amount) FILTER (
            WHERE t.type = 'expense'
          ),
          0
        )
      ) OVER () AS period_total_expense

    FROM months m

    LEFT JOIN accounts a
      ON a."userId" = $1

    LEFT JOIN transactions t
      ON t."accountId" = a.id
      AND (
        t."transactionTime" AT TIME ZONE 'Africa/Cairo'
      )::date BETWEEN m.month_start AND m.month_end

    GROUP BY
      m.month_start,
      m.month_end

    ORDER BY
      m.month_start ASC;
  `;

    return this.repository.query(query, [userId]);

  }
  async findMonthPeriodSummary(userId: string) {
    const query = `
   WITH weeks AS (
  SELECT
    week_start::date AS week_start,

    LEAST(
      (week_start + INTERVAL '6 days')::date,
      (
        DATE_TRUNC('month', CURRENT_DATE)
        + INTERVAL '1 month'
        - INTERVAL '1 day'
      )::date
    ) AS week_end

  FROM generate_series(
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE)
      + INTERVAL '1 month'
      - INTERVAL '1 day',
    INTERVAL '7 days'
  ) AS week_start
)

SELECT
  w.week_start,
  w.week_end,

  'Week ' || ROW_NUMBER() OVER (ORDER BY w.week_start) AS week_name,

  COALESCE(SUM(t.amount), 0) AS total,

  COALESCE(
    SUM(t.amount) FILTER (WHERE t.type = 'income'),
    0
  ) AS total_income,

  COALESCE(
    SUM(t.amount) FILTER (WHERE t.type = 'expense'),
    0
  ) AS total_expense,

  SUM(
    COALESCE(
      SUM(t.amount) FILTER (WHERE t.type = 'income'),
      0
    )
  ) OVER () AS period_total_income,

  SUM(
    COALESCE(
      SUM(t.amount) FILTER (WHERE t.type = 'expense'),
      0
    )
  ) OVER () AS period_total_expense

FROM weeks w

LEFT JOIN transactions t
  ON (
    t."transactionTime" AT TIME ZONE 'Africa/Cairo'
  )::date BETWEEN w.week_start AND w.week_end

LEFT JOIN accounts a
  ON a.id = t."accountId"
  AND a."userId" = $1

GROUP BY
  w.week_start,
  w.week_end

ORDER BY
  w.week_start ASC;
  `;

    return this.repository.query(query, [userId]);
  }


  async findWeekPeriodSummary(userId: string) {
    const query = `
    WITH days AS (
      SELECT
        day::date AS date
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS day
    )

    SELECT
      d.date,

      TRIM(
        TO_CHAR(d.date, 'Day')
      ) AS day,

      TRIM(
        TO_CHAR(d.date, 'Month')
      ) AS month,

      COALESCE(
        SUM(t.amount),
        0
      ) AS total,

      COALESCE(
        SUM(t.amount) FILTER (
          WHERE t.type = 'income'
        ),
        0
      ) AS total_income,

      COALESCE(
        SUM(t.amount) FILTER (
          WHERE t.type = 'expense'
        ),
        0
      ) AS total_expense,

      SUM(
        COALESCE(
          SUM(t.amount) FILTER (
            WHERE t.type = 'income'
          ),
          0
        )
      ) OVER () AS period_total_income,

      SUM(
        COALESCE(
          SUM(t.amount) FILTER (
            WHERE t.type = 'expense'
          ),
          0
        )
      ) OVER () AS period_total_expense

    FROM days d

    LEFT JOIN accounts a
      ON a."userId" = $1

    LEFT JOIN transactions t
      ON t."accountId" = a.id
      AND (
        t."transactionTime" AT TIME ZONE 'Africa/Cairo'
      )::date = d.date

    GROUP BY
      d.date

    ORDER BY
      d.date DESC;
  `;

    return this.repository.query(query, [userId]);
  }

  async findByPeriod(
  userId: string,
  dto: GetTransactionDto,
) {

 
  const page = dto.page ?? 1;
  const limit = dto.limit ?? 20;

  const skip = (page - 1) * limit;

  const query = this.repository
    .createQueryBuilder('transaction')
    .innerJoinAndSelect('transaction.account', 'account')
    .leftJoinAndSelect('transaction.category', 'category')
    .addSelect(
      `EXTRACT(
        YEAR FROM (
          transaction."transactionTime" AT TIME ZONE 'Africa/Cairo'
        )
      )`,
      'year',
    )
    .addSelect(
      `TRIM(
    TO_CHAR(
      transaction."transactionTime" AT TIME ZONE 'Africa/Cairo',
      'Month'
    )
  )`,
      'month',
    )
    .where('account.userId = :userId', { userId });


   const periodDates = getPeriodDates(dto.period);

  if (periodDates) {
    query
      .andWhere(
        'transaction.transactionTime >= :startDate',
        {
          startDate: periodDates.startDate,
        },
      )
      .andWhere(
        'transaction.transactionTime < :endDate',
        {
          endDate: periodDates.endDate,
        },
      );
  }
  if (dto.accountId) {
    query.andWhere(
      'transaction.accountId = :accountId',
      {
        accountId: dto.accountId,
      },
    );
  }

  if (dto.type) {
    query.andWhere(
      'transaction.type = :type',
      {
        type: dto.type,
      },
    );
  }

  if (dto.categoryId) {
    query.andWhere(
      'category.id = :id',
      {
        id: dto.categoryId,
      },
    );
  }

  const total = await query.getCount();

  const { entities, raw } = await query
    .orderBy('transaction.transactionTime', 'DESC')
    .addOrderBy('transaction.id', 'DESC')
    .skip(skip)
    .take(limit)
    .getRawAndEntities();

  console.log(entities)

  const data = entities.map((transaction, index) => ({
    ...transaction,
    year: Number(raw[index].year),
    month: raw[index].month,
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
}


async searchTransactions(
  userId: string,
  dto: SearchTransactionsDto,
) {
  const page = dto.page ?? 1;
  const limit = dto.limit ?? 20;

  const skip = (page - 1) * limit;

  const query = this.repository
    .createQueryBuilder('transaction')
    .innerJoinAndSelect('transaction.account', 'account')
    .leftJoinAndSelect('transaction.category', 'category')
    .where('account.userId = :userId', { userId });

  // Account filter
  if (dto.accountId) {
    query.andWhere(
      'transaction.accountId = :accountId',
      {
        accountId: dto.accountId,
      },
    );
  }

  // Category filter
  if (dto.categoryId) {
    query.andWhere(
      'transaction.categoryId = :categoryId',
      {
        categoryId: dto.categoryId,
      },
    );
  }

  // Transaction type filter
  if (dto.type) {
    query.andWhere(
      'transaction.type = :type',
      {
        type: dto.type,
      },
    );
  }

  // Search transaction title
  if (dto.searchTerm?.trim()) {
    query.andWhere(
      'transaction.title ILIKE :search',
      {
        search: `%${dto.searchTerm.trim()}%`,
      },
    );
  }

  // Date filter - Cairo calendar date, ignoring time
  if (dto.date) {
  query.andWhere(
    `CAST(transaction."transactionTime" AT TIME ZONE 'Africa/Cairo' AS DATE) = :date`,
    {
      date: dto.date,
    },
  );
}

  const [transactions, total] = await query
    .orderBy('transaction.transactionTime', 'DESC')
    .addOrderBy('transaction.id', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();



  return {
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
}

  async getTotalExpenses(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .select(
        'COALESCE(SUM(transaction.amount), 0)',
        'totalExpenses',
      )
      
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.type = :type', {
        type: TransactionType.EXPENSE,
      })
      .getRawOne();

    return Number(result.totalExpenses);
  }

  async getTotalIncome(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .select(
        'COALESCE(SUM(transaction.amount), 0)',
        'totalExpenses',
      )
      
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.type = :type', {
        type: TransactionType.INCOME,
      })
      .getRawOne();

    return Number(result.totalExpenses);
  }

  async getLastWeekIncome(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .select(
        'COALESCE(SUM(transaction.amount), 0)',
        'totalExpenses',
      )
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.type = :type', {
        type: TransactionType.INCOME,
      })
      .andWhere('transaction.transactionTime < NOW()::DATE')
      .andWhere('transaction.transactionTime > NOW()::DATE - INTERVAL \'1 week\'')
      .getRawOne();

    return Number(result.totalExpenses);
  }



  async findByAccount(userId: string, accountId: string): Promise<Transaction[]> {
    return this.repository.find({
      where: {
        account: {
          id: accountId,
          userId: userId
        }
      },
      relations: {
        account: true,
      },
    })
  }

  async findAll(userId: string): Promise<Transaction[]> {
    return this.repository.find({
      where: {

        account: {
          userId
        }
      },
      relations: {
        account: true,
      },
    })
  }

}