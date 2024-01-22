const fisher = require ('./classifier')

fisher.classify = function (item, def = 'none') {
  let best = def
  let max = 0
  const categories = this.getCategories()

  categories.forEach(function (cat) {
    const p = fisher.fisherProb(item, cat)

    if (p > fisher.getMinimum(cat) && p > max) {
      max = p
      best = cat
    }
  })
  return best
}

fisher.cProb = function (ftr, cat) {
  const clf = this.ftrProb(ftr, cat)

  if (clf === 0) {
    return 0
  }

  const freqSum = this.getCategories().reduce(
    (result, key) => result + this.ftrProb(ftr, key), 0)

  return clf/freqSum
}

fisher.fisherProb = function (item, cat) {
  const features = this.getFeatures(item)
  const prob = features.reduce(
    (result, ftr) => {
      return result * this.weightedProb(ftr, cat, this.cProb(ftr, cat))
    }, 1)
  const fScore = (-2) * Math.log(prob)

  return this.invChi2(fScore, features.length * 2)
}

fisher.getMinimum = function (cat) {
  return this.minimums[cat] || 0.5
}

fisher.invChi2 = function (chi, df) {
  const m = chi / 2.0
  let sum = Math.exp((-1) * m)
  let term = Math.exp((-1) * m)

  for(let i = 1; i < Math.floor(df / 2); i++) {
    term *= m / i
    sum += term
  }
  return sum < 1.0 ? sum : 1.0
}

fisher.setMinimum = function (cat, min) {
  this.minimums[cat] = min
  return this
}

module.exports = fisher
