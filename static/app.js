var outputContainerElements = document.querySelectorAll('.outputs'),
    inputContainerElements = document.querySelectorAll('.inputs'),
    outputElems,
    inputElems,
    outputs = [],
    inputs = [],
    DEFAULT_OUTPUTS = [
      {
        'id': 7,
        'name': 'Fab Lab',
        'input': 3,
        'volume': 70
      },
      {
        'id': 1,
        'name': 'Office',
        'input': 1,
        'volume': 70
      },
      {
        'id': 2,
        'name': 'Front Door',
        'input': 4,
        'volume': 70
      },
      {
        'id': 4,
        'name': 'Loft',
        'input': 2,
        'volume': 70
      },
      {
        'id': 3,
        'name': 'Shop',
        'input': 5,
        'volume': 70
      },
      {
        'id': 6,
        'name': 'Kitchen',
        'input': 6,
        'volume': 70
      }
    ],
    DEFAULT_INPUTS = [
      {
        'id': 1,
        'name': 'fkboi'
      },
      {
        'id': 2,
        'name': 'hnr sux'
      },
      {
        'id': 3,
        'name': 'jake does not sux'
      },
      {
        'id': 4,
        'name': 't and krumpets'
      },
      {
        'id': 5,
        'name': 'fk fk fk fk fk fkfk fk fk fakf a kfak afkaf  fuk u'
      },
      {
        'id': 6,
        'name': 'gleipnir'
      },
      {
        'id': 10,
        'name': 'spare'
      },
      {
        'id': 11,
        'name': 'spare 2 electrical spectactrical'
      },
      {
        'id': 12,
        'name': 'spare 3 electric boogadee'
      }
    ],
    DEFAULT_SOURCE_URL = '',
    channels = document.querySelectorAll('.channel:not(.unconnected)'),
    srcURL = '',
    unconnectedChannel = document.getElementById('unconnected'),
    // user input stuff
    clickedNode = null,
    mousedownTarget = null,
    updatedOutputs = [],
    dragged = null
      
// input handlers
var onMouseup = function (e) {
  e.stopPropagation()
  
  // for determining .selected highlighting
  var previousClickedNode = clickedNode

  if(mousedownTarget !== null && mousedownTarget === e.target) {
    if(clickedNode === null) {
      if(mousedownTarget.classList.contains('output')) {
        if(mousedownTarget.getAttribute('data-input') !== 'null' && mousedownTarget.getAttribute('data-input') !== '') {
          var clickedOutput = mousedownTarget
          clickedOutput.setAttribute('data-input', null)
          for(var o in outputs) {
            if(outputs[o].input !== null && parseInt(clickedOutput.getAttribute('data-id')) === outputs[o].id) {
              updatedOutputs.push(convertElemToIO(clickedOutput))
            }
          }
        }
        else clickedNode = mousedownTarget
      }
      // else if (mousedownTarget.classList.contains('volume')) ...
      // else if (mousedownTarget.classList.contains('cancel')) ...
      else if(mousedownTarget.classList.contains('input')) {
        clickedNode = mousedownTarget
      }
    }
    else if(clickedNode.classList.contains('input')) {
      if(mousedownTarget === clickedNode)
        clickedNode = null
      else if(mousedownTarget.classList.contains('input'))
        clickedNode = mousedownTarget
      else if(mousedownTarget.classList.contains('output')) {
        mousedownTarget.setAttribute('data-input', clickedNode.getAttribute('data-id'))
        var targetOutput = convertElemToIO(mousedownTarget)
        updatedOutputs.push(targetOutput)
        clickedNode = null
      }
    }
    else if(clickedNode.classList.contains('output')) {
      if(mousedownTarget === clickedNode)
        clickedNode = null
      else if(mousedownTarget.classList.contains('output')) 
        clickedNode = mousedownTarget
      else if(mousedownTarget.classList.contains('input')) {
        clickedNode.setAttribute('data-input', mousedownTarget.getAttribute('data-id'))
        var targetOutput = convertElemToIO(clickedNode)
        updatedOutputs.push(targetOutput)
        clickedNode = null
      }
    }
    else clickedNode = null
  }
  else if(mousedownTarget !== null && mousedownTarget.classList.contains('input')) {
    if(e.target.classList.contains('output')) {
      e.target.setAttribute('data-input', mousedownTarget.getAttribute('data-id'))
      var targetOutput = convertElemToIO(e.target)
      for(var o in outputs)
        if(outputs[o].id === parseInt(targetOutput.id))
          updatedOutputs.push(targetOutput)

      clickedNode = null
    }
  }
  else { 
    clickedNode = null
  }

  putOutputs(updatedOutputs, updateOutputs)
  updatedOutputs = []

  if(previousClickedNode === null && clickedNode !== null)
    clickedNode.classList.add('selected')
  else if(previousClickedNode !== null && clickedNode === null)
    previousClickedNode.classList.remove('selected')
  else if(previousClickedNode !== null && clickedNode !== null) {
    previousClickedNode.classList.remove('selected')
    clickedNode.classList.add('selected')
  }
}
var onMousedown = function (e) {
  e.stopPropagation()
  mousedownTarget = e.target
}
var onDragStart = function (e) { 
  e.stopPropagation()

  // make sure it's actually an <io>
  if(!isIOElem(e.target)) 
    return false

  dragged = e.target
}
var onDrag = function (e) {
  e.stopPropagation()

  // make sure it's actually the thing we think it is
  if(e.target !== dragged || dragged === null) return false;

  var draggedBox = dragged.getBoundingClientRect()
  dragged.style.position = 'relative'
  dragged.style.top = screenY - (dragged.clientHeight / 2)
  dragged.style.left = screenX - (dragged.clientWidth / 2)
}  
var onDragEnd = function (e) {
  e.stopPropagation()
  

}
var onDragOver = function (e) {
  e.preventDefault()
}
var onDrop = function (e) {
  e.stopPropagation()
  
  var io = e.target
  
  if(
    // if it's an <io> AND
    isIOElem(io)
    && 
    (
      // we dragged an input to an output
      (io.classList.contains('output') && dragged.classList.contains('input'))
      // OR
      ||
      // we dragged an output to an input
      (io.classList.contains('input') && dragged.classList.contains('output'))
    )
  ) {
    // figure out which is which
    var i, o
    
    if(io.classList.contains('output'))
      o = io
    else i = io
    
    if(o !== io)
      o = dragged
    else i = dragged
    
    o.setAttribute('data-input', i.getAttribute('data-id'))
    updatedOutputs.push(convertElemToIO(o))
    
    putOutputs(updatedOutputs, updateOutputs)
    updatedOutputs = []
  }
}

// set up the app
var configure = function (opts) {
  // maybe add the ability to seed with other
  // input/output data?
  if(opts !== undefined)
    if(typeof opts.url !== 'undefined')
      srcURL = opts.url

  if(srcURL !== '')
    if(typeof srcURL !== 'string')
      throw new TypeError('Source URL must be a string.')
    else {
      outputs = getOutputs()
      inputs = getInputs()
    }
  else {
    outputs = extractIOElementsFromContainerElements(outputContainerElements).filter(isIOElem)
    inputs = extractIOElementsFromContainerElements(inputContainerElements).filter(isIOElem)
    outputs.forEach(function (e, i, a) { a[i] = convertElemToIO(e) })
    inputs.forEach(function (e, i, a) { a[i] = convertElemToIO(e) })
  }

  outputs.sort(compareIO)
  inputs.sort(compareIO)
}

// comparison function for inputs/outputs
// (only concerned with id)
var compareIO = function (a, b) {
  return a.id - b.id
}
var removeIO = function (io, arr) {
  var index = arr.indexOf(io)
  if(index !== -1)
    arr.splice(index, 1)
}

var getInputs = function (callback) {
  // make this fetch from server
  var rq = new XMLHttpRequest()
  rq.addEventListener('load', callback)
  rq.open('GET', '/inputs/')
  rq.send()
}
var getOutputs = function (callback) {
  // make this fetch from server
  var rq = new XMLHttpRequest()
  rq.addEventListener('load', callback)
  rq.open('GET', '/outputs/')
  rq.send()
}

// returns 3 arrays detailing event types to use
// in handling all elements of newArr that are not
// identical to an element in oldArr (compared 
// by id, name, input, and volume, if possible)
// NOTE: assumes arrays are sorted
// NOTE: still need a way to remove oldArr elems
// that no longer exist
var diff = function (oldArr, newArr) {
  var del = [],
      upd = [],
      add = [],
      index = 0 // for keeping track of the current oldEle

  for(var newEle in newArr) {
    var n = newArr[newEle]

    // if we've reached the end of oldArr but still
    // have new elements, they must be new, so add them.
    if(typeof oldArr[index] === 'undefined') {
      add.push(n)
      continue
    }

    // delete any old elements that
    // are not contained in the new
    // array
    // ex. old: [2, 3, 4], new: [1, 2], index: 0
    // 2 >= 1, skip, index++
    // 3 >= 2, skip, index++
    while (index < oldArr.length && oldArr[index].id < n.id)
      del.push(oldArr[index++])
    if (index >= oldArr.length)
      continue
    // mark anything different as update
    var o = oldArr[index]
    if(o.name !== n.name
      || (typeof n.input !== 'undefined' 
          && o.input !== n.input)
      || (typeof n.volume !== 'undefined'
         && o.volume !== o.volume))
      upd.push(n)

    index++
  }

  while(index < oldArr.length)
    del.push(oldArr[index++])

  return { 'del': del, 'upd': upd, 'add': add }
}

// array.filter callback for removing elems that
// are not inputs or outputs
var isIOElem = function (e) {
  return (typeof e.getAttribute('data-id') !== 'undefined')
}

// checks the return value of diff() to see
// if there's any difference
var hasActionsToTake = function (actions) {
  return actions.del.length > 0 || actions.upd.length > 0 || actions.add.length > 0
}

// construct an <io>
var convertIOToElem = function (io) {
  var isInput = true,
      e

  // if we don't have an associated input, we're an output
  if(typeof io.input !== 'undefined')
    isInput = false

  e = document.createElement('div')
  e.classList.add(isInput ? 'input' : 'output')
  e.setAttribute('data-id', io.id)
  e.textContent = io.name
  e.setAttribute('draggable', true)
  if(!isInput) e.setAttribute('data-input', (io.input === null)? '' : io.input)
  if(!isInput) e.setAttribute('data-volume', io.volume)
  return e
}

// construct an {io}
var convertElemToIO = function (e) {
  var io = {}
  io.id = e.getAttribute('data-id')
  io.name = e.textContent
  if(e.classList.contains('output')) {
    io.volume = e.getAttribute('data-volume')
    io.input = e.getAttribute('data-input')
  }
  return io
}

var configureInputs = function (io) {
  io.addEventListener('mousedown', onMousedown)
  io.addEventListener('mouseup', onMouseup)
  io.setAttribute('draggable', true)
  io.addEventListener('dragstart', onDragStart)
  io.addEventListener('drag', onDrag)
  io.addEventListener('dragover', onDragOver)
  io.addEventListener('drop', onDrop)
}

var updateElems = function (elems, actions) {
  
  // if there's an add action, 
  //   append a new <io> to the unconnected channel
  for(var a in actions.add) {
    var io = actions.add[a],
        ioElem = convertIOToElem(io)
    if(io.hasOwnProperty('input'))
      ioElem = unconnectedChannel.querySelector('.outputs').appendChild(ioElem)
    else
      ioElem = unconnectedChannel.querySelector('.inputs').appendChild(ioElem)
      
    configureInputs(ioElem)
      
    if(io.hasOwnProperty('input') && io.input !== null) {
      var o = ioElem,
          i = document.querySelector('.input[data-id="' + io.input + '"]')
      destroyConnection(o)
      createConnection(o, i)
    }
  }

  // if there's an update action,
  //   find the element that shares a data-id value
  //   with the action's id value, 
  //   then make all applicable values the same.
  for(var u in actions.upd) {
    for(var e in elems) {
      var el = elems[e],
          io = actions.upd[u]
      if(parseInt(el.getAttribute('data-id')) === io.id) {
        el.textContent = io.name
        if(el.classList.contains('output')) {
          var o = el
          o.setAttribute('data-volume', io.volume)
          var inputString = (io.input === null)? '' : null
          if(o.getAttribute('data-input') !== inputString) {
            var i = document.querySelector('.input[data-id="' + io.input + '"]')
            // destroying a connection
            if(inputString === '' && (o.getAttribute('data-input') !== undefined && o.getAttribute('data-input') !== null)) {
              destroyConnection(o)
            }
            // creating a connection
            else if(inputString !== '' && (o.getAttribute('data-input') === null)) {
              createConnection(o, i)
            }
            // destroying and then creating a connection
            else if (inputString !== '' && (o.getAttribute('data-input') !== null)) {
              destroyConnection(o)
              createConnection(o, i)
            }
            o.setAttribute('data-input', io.input)
          }
        }
      }

    }
  }

  // if there's a delete action,
  // find the element that shares a data-id value
  // with the action's id value,
  // then have it ask its parent to commit infanticide
  // "KILL ME"
  for(var d in actions.del) 
    for(var e in elems) {
      var output = elems[e]
      if(output.getAttribute('data-id') === actions.del[d].id) {
        var containerElement = output.parentNode,
            channel = containerElement.parentElement
        containerElement.removeChild(output)
        unconnectedChannel.appendChild(output)
        // if it's empty now and it's not the unconnected channel,
        //    then kill it and move the input to the unconnected channel
        if(   channel !== unconnectedChannel 
           && containerElement.childNodes.length === 0 
           && output.getAttribute('data-input')) {
          var input = channel.querySelector('.inputs').querySelector('.input')
          unconnectedChannel.appendChild(input)
          input.parentElement.removeChild(input)
        }
      }
    }
} 

var destroyConnection = function (output) {
  
  var channel = output.parentElement.parentElement
  // if there's only one output connected, we assume 
  // that it's this output, so let's move it,
  // move the input and then kill this channel
  if(output.parentElement.querySelectorAll('.output').length === 1) {
    // move the input
    unconnectedChannel.querySelector('.inputs').appendChild(channel.querySelector('.inputs').querySelector('.input'))
    // move the output
    unconnectedChannel.querySelector('.outputs').appendChild(output)
    // kill the channel
    if(channel !== unconnectedChannel) channel.parentElement.removeChild(channel)
  }
  // otherwise, just move our input
  else if(output.parentElement.querySelectorAll('.output').length > 1) {
    // add the output to the unconnected channel
    unconnectedChannel.querySelector('.outputs').appendChild(output)
    // remove it from its current channel if it's still there
    if(output.parentElement !== null && output.parentElement.parentElement !== null && output.parentElement.parentElement === channel)
      channel.querySelector('.outputs').removeChild(output)
  }
}
var createConnection = function (output, input) {
  
  var outputs

  if (typeof input !== 'undefined' && input.parentElement === null)
    unconnectedChannel.querySelector('.inputs').appendChild(input)

  else if(input.parentElement.parentElement === unconnectedChannel) {
    var channelsElement = unconnectedChannel.parentElement

    var newChannel = document.createElement('div')
    newChannel.classList.add('channel')
    channelsElement.appendChild(newChannel)

    var inputs = document.createElement('div')
    inputs.classList.add('inputs')
    newChannel.appendChild(inputs)

    outputs = document.createElement('div')
    outputs.classList.add('outputs')
    newChannel.appendChild(outputs)

    if(input.parentElement !== null) input.parentElement.removeChild(input)
    inputs.appendChild(input)
  }
  else outputs = input.parentElement.parentElement.querySelector('.outputs')

  if(output.parentElement !== null) output.parentElement.removeChild(output)
  outputs.appendChild(output)
}

var extractIOElementsFromContainerElements = function (containerElements) {
  var ioElements = [],
      containers = [].slice.call(containerElements)
  
  for(var c in containers)
    ioElements = ioElements.concat([].slice.call(containers[c].getElementsByClassName((containers[c].classList.contains('inputs')? 'input' : 'output'))))

  return ioElements
}

var updateDOM = function (actions, type) {
  // fetch all children of outputs & inputs, 
  // ensure all of them are actually io elems
  
  // make sure containers are up to date
  outputContainerElements = document.querySelectorAll('.outputs')
  inputContainerElements = document.querySelectorAll('.inputs')
  channels = document.querySelectorAll('.channel:not(.unconnected)')
  
  var elems = extractIOElementsFromContainerElements(
    (type === 'inputs')? inputContainerElements : outputContainerElements
  ).filter(isIOElem)

  if(hasActionsToTake(actions))
    updateElems(elems, actions)
}

var putInputs = function (inputs, callback) {
  // this should basically never happen...
  if(inputs.length <= 0) return
  
  for(var i in inputs) {
    var input = inputs[i],
        rq = new XMLHttpRequest()
    rq.addEventListener('load', callback.bind(this))
    rq.open('PUT', '/inputs/' + input.id)
    rq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    rq.send()
  }
}
var putOutputs = function (outputs, callback) {
  
  if(outputs.length <= 0) return
  
  for(var o in outputs) {
    var output = outputs[o],
        rq = new XMLHttpRequest()
    rq.addEventListener('load', callback)
    rq.open('PUT', '/outputs/' + output.id)
    rq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    rq.send('input=' + output.input + '&volume=' + output.volume)
  }
}

// main cycle.
var updateInputs = function () {
  getInputs(function (res) {
    var newInputs = JSON.parse(res.target.response).filter(input => input.enabled).sort(compareIO)
    updateDOM(diff(inputs, newInputs), 'inputs')
    inputs = newInputs
  }.bind(this))
}
var updateOutputs = function () {
  getOutputs(function (res) {
    var newOutputs = JSON.parse(res.target.response).filter(output => output.enabled).sort(compareIO)
    updateDOM(diff(outputs, newOutputs), 'outputs')
    outputs = newOutputs
  }.bind(this))
}

var main = function () {
  updateInputs()
  updateOutputs()
};

(function () {
  // setup
  configure()
  getInputs(function (res) {
    var newInputs = JSON.parse(res.target.response).sort(compareIO)
    updateDOM(diff(inputs, newInputs), 'inputs')
    inputs = newInputs
    getOutputs(function (res) {
      var newOutputs = JSON.parse(res.target.response).sort(compareIO)
      updateDOM(diff(outputs, newOutputs), 'outputs')
      outputs = newOutputs
    }.bind(this))
  }.bind(this))
  setInterval(main.bind(this), 1000)
})();