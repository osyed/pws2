
// This file was taken from the GrydValidator project
//   which was installed using npm in the node directory
/**
 * Project Name: GrydValidator
 * Author: Aaron Blankenship
 * Date: 07-23-2014
 *
 * Copyright (c) 2014, Aaron Blankenship

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee
 * is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE
 * FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING
 * OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */

function Invalid_(){

/*
//  Example of how to use it

// Lets say you got this object as a form input
Form = { handle:'steve', password:'abc', password2::'abc' }

// These are the rules you have defined for various forms and the fields they have
Rules = {
  join:{
    handle:['required'],
    password:['required'],
    password2:['required']
  },
  login:{
    password:['required']
  },
  new_contact:{
    handle:['required'],
    name:['required']
  },
  new_message:{
    handle:['required'],
    message:['required']
  }
}

// this is how you check the form input
err = check(Form, Rules, 'join')
if (err){ alert(err); return }

*/

function check(input, ruleset, form){
  var rules = ruleset[form]
  res = _validate_one(input, rules)
  if (res){
    return res[Object.keys(res)][0].msg
  }
  return null
}
this.check = check




// Don't need to touch anything below this


exports =  function (exp) {
  if (exp && exp.hasOwnProperty('request') && exp.hasOwnProperty('application')) {
    var req = exp.request,
      app = exp.application;
    req.GrydValidate = GrydValidate;
    req.GrydValidateParams = GrydValidateParams;
    req.GrydValidateBody = GrydValidateBody;
    req.GrydValidateQuery = GrydValidateQuery;
    app.GrydValidatorExtend = GrydValidatorExtend;
  }
};



exports.GrydValidate = GrydValidate;

// Omar added the following to allow return after finding one problem
exports.GrydValidateOneSync = GrydValidateOneSync;
function GrydValidateOneSync(input, rules) {
  return(_validate_one(input, rules));
}


// Omar added the following to allow sync instead of async calls
exports.GrydValidateSync = GrydValidateSync;
function GrydValidateSync(input, rules) {
  return(_validate(input, rules));
}

function GrydValidate(input, rules, callback) {
  callback(_validate(input, rules));
}


function GrydValidateParams(rules, callback) {
  callback(_validate(this.params, rules));
}

function GrydValidateBody(rules, callback) {
  callback(_validate(this.body, rules));
}

function GrydValidateQuery(rules, callback) {
  callback(_validate(this.query, rules));
}

function GrydValidatorExtend(name, fn) {
  if (typeof name === 'string' && typeof fn === 'function')
    _GrydFunctions[name] = fn;
  else
    throw new SyntaxError('Invalid parameters. Usage: GrydValidatorExtend(string,function);');
}

// Omar added this so it stops after first error
function _validate_one(input, rules) {
  var results = {};

  for (var f in rules) {
    if (rules.hasOwnProperty(f)) {
      var field = rules[f];
      for (var r = 0; r < field.length; r++) {
        var rule = field[r].split(":");
        var params = [input, f, input[f]];

        if (rule.length > 1)
          params = params.concat(rule.splice(1, 1000));

        if (_GrydFunctions.hasOwnProperty(rule[0])) {
          var msg = _GrydFunctions[rule[0]].apply(this, params);
// Omar added checking of rule name starting with _ to support manipulation rules
          if (rule[0][0] == '_'){
            input[f] = msg;
            msg = false;
          }
          if (msg) {
            if (!results[f])
              results[f] = [];

            results[f].push({type: rule[0], msg: msg});
            return results;  // Omar added this line
          }
        }
      }
    }
  }
  return _isEmpty(results) ? null : results;
}

function _validate(input, rules) {
  var results = {};

console.log('in val')
  for (var f in rules) {
    if (rules.hasOwnProperty(f)) {
      var field = rules[f];
      for (var r = 0; r < field.length; r++) {
        var rule = field[r].split(":");
        var params = [input, f, input[f]];

        if (rule.length > 1)
          params = params.concat(rule.splice(1, 1000));

        if (_GrydFunctions.hasOwnProperty(rule[0])) {
          var msg = _GrydFunctions[rule[0]].apply(this, params);
// Omar added checking of rule name starting with _ to support manipulation rules
          if (rule[0][0] == '_'){
            input[f] = msg;
            msg = false;
          }
          if (msg) {
            if (!results[f])
              results[f] = [];

            results[f].push({type: rule[0], msg: msg});
          }
        }
      }
    }
  }
  return _isEmpty(results) ? null : results;
}

var _GrydFunctions = {
// Omar add this manipulation function which removes white space from ends of strings; " hello world  " -> "hello world"
  _trim: function (input, name, val) {
    return val.replace(/^\s+/, '').replace(/\s+$/, '')
  },
  required: function (input, name, val) {
    if (_emptyString(val))
      return "Field `" + name + "` is required.";

    return false;
  },
  requiredWith: function (input, name, val, fieldname) {
    if (!fieldname) {
      throw new SyntaxError("Validator `requiredWith` requires a `fieldname` parameter");
    }

    if (input.hasOwnProperty(fieldname)) {
      if (_emptyString(val))
        return "Field `" + name + "` is required with field `" + fieldname + "`.";
    }

    return false;
  },
  requiredWithout: function (input, name, val, fieldname) {
    if (!fieldname) {
      throw new SyntaxError("Validator `requiredWithout` requires a `fieldname` parameter");
    }

    if (!input.hasOwnProperty(fieldname)) {
      if (_emptyString(val))
        return "Field `" + name + "` is required without field `" + fieldname + "`.";
    }

    return false;
  },
// Omar fixed this function; need to submit the changes
  regex: function (input, name, val, exp) {
    var reg = new RegExp(exp);

    if (!reg.test(val))
      return "Field `" + name + "` does not match the expected regular expression format. `/"+exp+"/`.";

    return false;
  },
  array: function (input, name, val) {
    if (!_emptyString(val)) {
      if (!(val instanceof Array))
        return "Field `" + name + "` must be an array.";
    }
    return false;
  },
  sameAs: function (input, name, val, fieldname) {
    if (!_emptyString(val)) {
      if (!fieldname) {
        throw new SyntaxError("Validator `sameAs` requires a `fieldname` parameter");
      }

      if (input.hasOwnProperty(fieldname)) {
        if (input[fieldname] != val)
          return "Field `" + name + "` must match field " + fieldname + ".";
      }
    }
    return false;
  },
  num: function (input, name, val, min, max) {
    if (!_emptyString(val)) {
      if (isNaN(val)) {
        return "Field `" + name + "` is not a number.";
      } else {
        val = parseInt(val);
        min = parseInt(min);
        max = parseInt(max);
        if (typeof min != 'undefined' && val < min)
          return "Field `" + name + "` is less than the minimum value of `" + min + "`.";
        if (typeof max != 'undefined' && val > max)
          return "Field `" + name + "` is greater than the maximum value of `" + max + "`.";
      }
    }
    return false;
  },
  url: function (input, name, val) {
    if (!_emptyString(val)) {
      if (!_reg.url.test(val))
        return "Field `" + name + "` must be a valid URL.";
    }
    return false;
  },
  email: function (input, name, val) {
    if (!_emptyString(val)) {
      if (!_reg.email.test(val))
        return "Field `" + name + "` must be a valid email address.";
    }
    return false;
  },
  bool: function (input, name, val) {
    var trueReg = /[Tt][Rr][Uu][Ee]/g,
      falseReg = /[Ff][Aa][Ll][Ss][Ee]/g;
    if (!_emptyString(val)) {
      if (!(typeof val == 'boolean' || trueReg.test(val) || falseReg.test(val) || val == 1 || val == 0)) {
        return "Field `" + name + "` must be a boolean value.";
      }
    }
    return false;
  },
  date: function (input, name, val, after, before) {
    if (!_emptyString(val)) {
      val = new Date(val);

      if (!_isValidDate(val))
        return "Field `" + name + "` must be a date string or object.";

      if (after) {
        after = new Date(parseInt(after));
        if (!_isValidDate(after))
          throw new SyntaxError("Validator `date` requires a proper date format for the `after` parameter");

        if (val < after)
          return "Field `" + name + "` must be a date after `" + after.toUTCString() + "`.";
      }

      if (before) {
        before = new Date(parseInt(before));
        if (!_isValidDate(before))
          throw new SyntaxError("Validator `date` requires a proper date format for the `before` parameter");

        if (val > before)
          return "Field `" + name + "` must be a date prior to `" + before.toUTCString() + "`.";
      }

    }
    return false;
  },
  different: function (input, name, val, fieldname) {
    if (!_emptyString(val)) {
      if (!fieldname) {
        throw new SyntaxError("Validator `different` requires a `fieldname` parameter");
      }

      if (input.hasOwnProperty(fieldname)) {
        if (input[fieldname] == val)
          return "Field `" + name + "` must not match field " + fieldname + ".";
      }
    }
    return false;
  }
};

function _emptyString(val) {
  return (val === '' || val === null || val === undefined);
}

function _isEmpty(o) {
  for (var i in o) {
    if (o.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
}

function _isValidDate(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}

var _reg = {
  email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
  url: /(ftp|rtmp|git|https?):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
};




}

