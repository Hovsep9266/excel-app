import './WorkMonthTable.css';
import { useI18n } from '../i18n/i18n';
import { formatAmountTotal, formatHoursTotal, parseNumericCell, sumNumericCells } from '../utils/formatCellValue';
import { translateMonthName } from '../utils/translateMonthName';

function MonthBlockTable({ monthLabel, monthKey, days, hours, hoursTotal, amounts, hoursLabel, amountLabel, totalLabel }) {
  const dayCount = days.length;
  const alignedHours = hours.slice(0, dayCount);
  const alignedAmounts = amounts.slice(0, dayCount);

  const hoursTotalDisplay = hoursTotal
    ? formatHoursTotal(parseNumericCell(hoursTotal))
    : formatHoursTotal(sumNumericCells(alignedHours));
  const amountTotal = formatAmountTotal(sumNumericCells(alignedAmounts));

  return (
    <table className="work-month-table">
      <thead>
        <tr>
          <th className="work-month-name">{monthLabel}</th>
          {days.map((day, index) => (
            <th key={`day-${monthKey}-${index}`} className="work-day-head">
              {day}
            </th>
          ))}
          <th className="work-total-head">{totalLabel}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="work-hours-row">
          <th className="work-row-label">{hoursLabel}</th>
          {alignedHours.map((value, index) => (
            <td key={`hours-${monthKey}-${index}`} className={value ? '' : 'work-cell-empty'}>
              {value}
            </td>
          ))}
          <td className="work-total-cell">{hoursTotalDisplay}</td>
        </tr>
        <tr className="work-amount-row">
          <th className="work-row-label">{amountLabel}</th>
          {alignedAmounts.map((value, index) => (
            <td key={`amount-${monthKey}-${index}`} className={value ? '' : 'work-cell-empty'}>
              {value}
            </td>
          ))}
          <td className="work-total-cell">{amountTotal}</td>
        </tr>
      </tbody>
    </table>
  );
}

function SummaryMonthBlockTable({ monthLabel, monthKey, days, amounts, amountTotal, amountLabel, totalLabel }) {
  const dayCount = days.length;
  const alignedAmounts = amounts.slice(0, dayCount);
  const amountTotalDisplay =
    amountTotal || formatAmountTotal(sumNumericCells(alignedAmounts));

  return (
    <table className="work-month-table">
      <thead>
        <tr>
          <th className="work-month-name">{monthLabel}</th>
          {days.map((day, index) => (
            <th key={`day-${monthKey}-${index}`} className="work-day-head">
              {day}
            </th>
          ))}
          <th className="work-total-head">{totalLabel}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="work-amount-row">
          <th className="work-row-label">{amountLabel}</th>
          {alignedAmounts.map((value, index) => (
            <td key={`amount-${monthKey}-${index}`} className={value ? '' : 'work-cell-empty'}>
              {value}
            </td>
          ))}
          <td className="work-total-cell">{amountTotalDisplay}</td>
        </tr>
      </tbody>
    </table>
  );
}

function WorkMonthTable({ blocks }) {
  const { t, lang } = useI18n();

  if (!blocks.length) {
    return (
      <div className="work-table-wrap">
        <p className="empty-text">{t('emptyRows')}</p>
      </div>
    );
  }

  return (
    <div className="work-table-wrap">
      {blocks.map((block, index) => {
        const monthLabel = translateMonthName(block.month, lang);
        const tableProps = {
          monthKey: block.month,
          monthLabel,
          days: block.days,
          amountLabel: t('amountLabel'),
          totalLabel: t('totalLabel'),
        };

        return (
          <section key={`${block.month}-${index}`} className="work-month-section">
            <div className="work-table-x-scroll">
              {block.layout === 'summary' ? (
                <SummaryMonthBlockTable
                  {...tableProps}
                  amounts={block.amounts}
                  amountTotal={block.amountTotal}
                />
              ) : (
                <MonthBlockTable
                  {...tableProps}
                  hours={block.hours}
                  hoursTotal={block.hoursTotal}
                  amounts={block.amounts}
                  hoursLabel={t('hoursLabel')}
                />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default WorkMonthTable;
