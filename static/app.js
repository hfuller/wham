(function () {
  
  var DEFAULT_OUTPUTS = [
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
      ]
      DEFAULT_SOURCE_URL = '',
      outputs = [],
      inputs = [],
      outputsElem = document.getElementById('outputs'),
      inputsElem = document.getElementById('inputs')
  
  
  var configure = function () {
    outputs = DEFAULT_OUTPUTS
    inputs = DEFAULT_INPUTS
    
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
      while (oldArr[index].id < n.id) 
        del.push(oldArr.splice(index, 1))
      
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
    
    return { 'delete': del, 'update': upd, 'add': add }
  }
  
  var updateDOM = function () {
      
  }
  
  console.log()
  
  
})