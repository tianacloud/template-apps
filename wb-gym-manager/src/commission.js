/** Compute the amount assigned to an order, independently of settlement. */
export function orderCommission(order, settings, courses) {
  const number = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const course = courses.find((item) => item.name === order.course);
  const rate = order.customRate != null
    ? number(order.customRate)
    : settings.mode === 'fixed'
      ? number(settings.fixedRate)
      : number(course?.rate ?? settings.rates?.[order.course]);
  const gross = order.commissionType === 'fixed'
    ? Math.round(number(order.fixedAmount))
    : Math.round((number(order.fee) - number(order.discount)) * rate / 100);
  return {
    rate,
    gross,
    earned: Math.max(0, gross - number(order.secondCommission)),
  };
}

export function countedCommission(order, settings, courses) {
  return settings.countDue === false && order.status === 'due'
    ? 0
    : orderCommission(order, settings, courses).earned;
}

/** The entry form displays separately rounded components. */
export function commissionPreview({ fee, discount, rate, commissionType, fixedAmount }) {
  const n = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  if (commissionType === 'fixed') {
    const amount = Math.round(n(fixedAmount));
    return { base: amount, discount: 0, amount };
  }
  const base = Math.round(n(fee) * n(rate) / 100);
  const reduction = Math.round(n(discount) * n(rate) / 100);
  return { base, discount: reduction, amount: base - reduction };
}
