export const StringArrayToBooleanMap = (array: string[]) => {
  return Object.values(array).reduce(
    (prev, curr) => ({ ...prev, [curr]: true }),
    {}
  )
}
