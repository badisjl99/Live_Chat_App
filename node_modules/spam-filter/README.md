# Spam filter
This spam filter lets you choose between using naive Bayes classifier or Fisher's method.

Data set was downloaded from http://www.dt.fee.unicamp.br/~tiago/smsspamcollection/.  
It is also available on http://dcomp.sor.ufscar.br/talmeida/smsspamcollection/.

To set up the filter, all you have to do is install the module, by typing:  
`npm install spam-filter`

## Usage:

### Initialization
Filter is initialized in a following way:
```
const filter = require('spam-filter')(methodName)
```
**methodName** can be *'naiveBayes'*, *'fisher'* or empty in which case naive Bayes classifier will be used.
</br>
</br>
### Naive Bayes specific methods
Naive Bayes classifier provides option to set and get thresholds for categories.
```
filter.setThreshold(category, 2)
filter.getThreshold(category)
```

### </br>Fisher's method specific methods
Fisher's method provides option to set and get minimum values for categories.
```
filter.setMinimum(category, 0.7)
filter.getMinimum(category)
```

**category** is a string, default categories are *'good'* and *'bad'*.  
Custom categories are possible, but not recommended.
</br>
</br>
### Common methods
Filter provides a set of methods that are available regardless of which filtering method is being used.  
Those are:  
`filter.isSpam(spamMsg)` - returns a boolean. Only works with default categories.

`filter.classify(spamMsg)` - returns the category, or *'none'* if string can't be categorized.

`filter.generate()` - generates a classifier object with 5500 categorized text messages.  
Generated object exists by default when module is installed.

`filter.empty()` - empties the classifier object.

`filter.train(spamMsg, category)` - trains the classifier, use category *'good'* for non-spam and *'bad'* for spam.

`filter.save()` - saves the state of the classifier object to the *dataSet.js* file.  
Unsaved changes to the classifier object will disappear once the program that uses the filter ends.
</br>
</br>
</br>
## Examples:

Overriding the data set with your own:
```
const filter = require('spam-filter')('fisher')
const newMessages = [
  ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'good'],
  ['Donec faucibus vulputate feugiat.', 'bad'],
  ['Duis eu sapien nec elit consectetur convallis.', 'good']
]

filter.empty()
newMessages.forEach(function (newMessage) {
  filter.train(newMessage[0], newMessage[1])
})
filter.setMinimum('bad', 0.65).save()
```

Writing a function that will train the classifier if the message can't be categorized, and then determine if it is spam:

```
const filter = require('spam-filter')()

function filterAndTrain(message) {
  if (filter.classify(message) === 'none') {
    filter.train(message, 'bad').save()
  }
  return filter.isSpam(message)
}
```
