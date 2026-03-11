export const thousandsSeparator = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') // 12.345.678
}
