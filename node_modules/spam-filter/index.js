function init (classifierName) {
  const classifier = require(`./${classifierName}`)
  const bound = name => classifier[name].bind(classifier)
  const common = {
    classify: bound('classify'),
    empty: bound('empty'),
    generate: bound('generate'),
    isSpam: item => classifier.classify(item) === 'bad',
    save: bound('save'),
    train: bound('train'),
  }

  if (classifierName === 'fisher') {
    return {
      ...common,
      getMinimum: bound('getMinimum'),
      setMinimum: bound('setMinimum'),
    }
  }
  return {
    ...common,
    getThreshold: bound('getThreshold'),
    setThreshold: bound('setThreshold'),
  }
}

module.exports = function (classifierName = 'naiveBayes') {
  try {
    return init(classifierName)
  } catch (e) {
    const error = new Error('Invalid initialization')
    error.code = 'EACCES'
    throw error
  }
}
