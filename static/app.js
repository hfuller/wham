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
      }
    ],
    DEFAULT_SOURCE_URL = '',
    channels = document.querySelectorAll('.channel:not(.unconnected)'),
    srcURL = '',
    unconnectedChannel = document.getElementById('unconnected')
  
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
    outputs = extractIOElementsFromContainerElements(outputContainerElements).filter(filterIOElems)
    inputs = extractIOElementsFromContainerElements(inputContainerElements).filter(filterIOElems)
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

var getInputs = function () {
  // make this fetch from server
  return DEFAULT_INPUTS
}
var getOutputs = function () {
  // make this fetch from server
  return DEFAULT_OUTPUTS
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
          && o.name !== n.name)
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
var filterIOElems = function (e) {
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
  if(!isInput) e.setAttribute('data-input', (io.input === null)? '' : io.input)
  if(!isInput) e.setAttribute('data-volume', io.volume)
  return e
}

// construct an {io}
var convertElemToIO = function (e) {
  var io = {}
  io.id = e.getAttribute('data-id')
  io.name = e.text
  if(e.classList.contains('output')) {
    io.volume = e.getAttribute('data-volume')
    io.input = e.getAttribute('data-input')
  }
  return io
}

var updateElems = function (elems, actions) {
  
  console.log()
  
  // if there's an add action, 
  //   append a new <io> to the unconnected channel
  for(var a in actions.add) {
    var io = actions.add[a],
        ioElem = convertIOToElem(io)
    if(io.hasOwnProperty('input'))
      ioElem = unconnectedChannel.querySelector('.outputs').appendChild(ioElem)
    else
      ioElem = unconnectedChannel.querySelector('.inputs').appendChild(ioElem)

    if(io.hasOwnProperty('input') && io.input !== '') {
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
      if(el.getAttribute('data-id') === io.id) {
        el.textContent = io.name
        if(el.classList.contains('output')) {
          var o = el
          o.setAttribute('data-volume', io.volume)
          var inputString = (io.input === null)? '' : null
          if(o.getAttribute('data-input') !== inputString) {
            var i = document.querySelector('.input[data-id="' + o.getAttribute('data-input') + '"]')
            // destroying a connection
            if(inputString === '' && (o.getAttribute('data-input') !== undefined && o.getAttribute('data-input') !== '')) {
              destroyConnection(o)
            }
            // creating a connection
            else if(inputString !== '' && (o.getAttribute('data-input') === '')) {
              createConnection(o, i)
            }
            // destroying and then creating a connection
            else if (inputString !== '' && (o.getAttribute('data-input') !== '')) {
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
    // move the output
    unconnectedChannel.querySelector('.outputs').appendChild(output)
    channel.querySelector('.outputs').removeChild(output)
  }
}
var createConnection = function (output, input) {

  console.log(input)

  var outputs

  if (typeof(input) !== 'undefined' && input.parentElement === null)
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
    ioElements.concat(containers[c].getElementsByClassName((containers[c].classList.contains('inputs')? 'input' : 'output')))

  return ioElements
}

var updateDOM = function (inputActions, outputActions) {
  // fetch all children of outputs & inputs, 
  // ensure all of them are actually io elems
  var outputElems = extractIOElementsFromContainerElements(outputContainerElements).filter(filterIOElems),
      inputElems = extractIOElementsFromContainerElements(inputContainerElements).filter(filterIOElems)

  if(hasActionsToTake(inputActions))
    updateElems(inputElems, inputActions)
  if(hasActionsToTake(outputActions))
    updateElems(outputElems, outputActions)
}

// main cycle.
// this could cause loading issues if the data src
// isn't responding quickly (promises would be better)
var main = function () {
  var newInputs  = getInputs().sort(compareIO)
  var newOutputs = getOutputs().sort(compareIO)
  updateDOM(diff(inputs, newInputs), diff(outputs, newOutputs))
  inputs = newInputs
  outputs = newOutputs
};

(function () {
  // setup
  configure()
  main()
  setInterval(main.bind(this), 1000)
})();

/*******************************
 **    INPUT CONFIGURATION    **
 *******************************/
(function () {
  // if a mouseup event comes in,
  //   then if there was just a mousedown event on the same element,
  //     then if nothing is clicked,
  //       then if an output was clicked,
  //         then if that output is connected,
  //           then disconnect that output.
  //         otherwise, do nothing.
  //       else if an output's volume button was clicked,
  //         then provide a volume slider UI.
  //       else if an output's cancel button was clicked,
  //         then disconnect that output.
  //       else if an input was clicked,
  //         then count that input as clicked.
  //       otherwise, do nothing.
  //     else if an input is clicked,
  //       then if the same input was clicked,
  //         then count that input as unclicked.
  //       else if an input was clicked,
  //         then count the more recently-clicked input as clicked instead.
  //       else if an output was clicked,
  //         then connect that input to that output and count that input as unclicked.
  //       otherwise, count the clicked input as unclicked.
  //     otherwise, do nothing.
  //   else if there was a mousedown event on an input,
  //     then if this mouseup event was on an output,
  //       then connect that input to that output and count everything as unclicked.
  //     otherwise, do nothing.
  //   otherwise, count everything as unclicked.
  
  var clickedNode = null,
      mousedownTarget = null
      
  var onMouseup = function (e) {
    e.preventDefault()
    if(mousedownTarget !== null && mousedownTarget === e.target) {
      if(clickedNode === null) {
        if(mousedownTarget.classList.contains('output')) {
          if(mousedownTarget.getAttribute('data-input') !== null) {
            mousedownTarget.setAttribute('data-input', null)
            var i = mousedownTarget.getAttribute('data-input')
            for(var o in outputs) 
              if(outputs[o].input !== null && i === outputs[o].input)
                outputs[o].input = null
          }
        }
        // else if (mousedownTarget.classList.contains('volume')) ...
        // else if (mousedownTarget.classList.contains('cancel')) ...
        else if(mousedownTarget.classList.contains('input'))
          clickedNode = mousedownTarget
      }
      else if(clickedNode.classList.contains('input')) {
        if(mousedownTarget === clickedNode)
          clickedNode = null
        else if(mousedownTarget.classList.contains('input'))
          clickedNode = mousedownTarget
        else if(mousedownTarget.classList.contains('output')) {
          mousedownTarget.setAttribute('data-input', clickedNode.getAttribute('data-id'))
          clickedNode = null
        }
      }
    }
    else if(mousedownTarget !== null && mousedownTarget.classList.contains('input')) {
      if(e.target.classList.contains('output')) {
        mousedownTarget.setAttribute('data-input', clickedNode.getAttribute('data-id'))
        clickedNode = null
      }
    }
    else clickedNode = null
    
    main()
  }
  
  var onMousedown = function (e) {
    e.preventDefault()
    mousedownTarget = e.target
  }
  
  document.addEventListener('mousedown', onMousedown.bind(this))
  document.addEventListener('mouseup', onMouseup.bind(this))
  
})()