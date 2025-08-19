export function splitAmountEqually(amount: number, countDebtors: number) {
  if (countDebtors === 0) {
    throw new Error('Não é possível dividir o valor entre zero devedores.')
  }

  const baseAmount = Math.floor((amount / countDebtors) * 100) / 100
  const amounts = Array(countDebtors).fill(baseAmount)
  const totalAssigned = baseAmount * countDebtors
  let remainder = Math.round((amount - totalAssigned) * 100) // em centavos

  // Distribui os centavos restantes para os primeiros devedores
  for (let i = 0; remainder > 0; i++, remainder--) {
    amounts[i] = Math.round((amounts[i] + 0.01) * 100) / 100
  }

  return amounts
}
