const naiveBayes = require('./classifier')

naiveBayes.classify = function (item, def = 'none') {
  let best = 'none'
  let max = 0
  const categories = this.getCategories()
  const probs = {}

  categories.forEach(function (cat) {
    probs[cat] = naiveBayes.prob(item, cat)

    if (probs[cat] > max) {
      max = probs[cat]
      best = cat
    }
  })
  return Object.keys(probs).find(
    cat => cat !== best && probs[cat] * this.getThreshold(best) > probs[best])
     ? def : best
}

naiveBayes.docProb = function (item, cat) {
  return this.getFeatures(item).reduce(
    (result, ftr) => result * this.weightedProb(ftr, cat, this.ftrProb(ftr, cat)), 1)
}

naiveBayes.getThreshold = function (cat) {
  return this.thresholds[cat] || 0.5
}

naiveBayes.prob = function (item, cat) {
  const catProb = this.catCount(cat) / this.totalCount()
  const docProb = this.docProb(item, cat)

  return docProb * catProb
}

naiveBayes.setThreshold = function (cat, t) {
  this.thresholds[cat] = t
  return this
}

module.exports = naiveBayes
