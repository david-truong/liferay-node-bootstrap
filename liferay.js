var http = require('http')
  , Step = require('step')
  , _ = require('underscore');

var auth = new Buffer("test@liferay.com:test").toString('base64');

Liferay = {
  getLayoutByFriendlyURL: function(friendlyURL) {
    var array = this.layouts;

    if (!array) {
      return null;
    }

    if (friendlyURL == '/') {
      return array[0];
    }

    var loop = function(i) {
      if (i < array.length) {
        if (array[i].friendlyURL == friendlyURL) {
          return array[i];
        }

        return process.nextTick(function() {
          loop(i+1);
        });

      }

      return null;
    };

    return loop(0);
  }
};

var options = {
    port: 8080
  , host: 'localhost'
  , headers: {
        'Host': 'localhost'
      , 'Authorization': 'Basic ' + auth
    }
};

Step(
  function getCompany() {
    var callback = this;

    options.path = '/api/secure/jsonws/company/get-company-by-virtual-host?virtualHost=localhost';
    http.get(options, function(res) {
      var data = "";

      res.on("data", function (chunk) {
          data += chunk;
      });

      res.on("end", function () {
          Liferay.company = JSON.parse(data);
          callback(null);
      });
    });
  },
  function getGroup(err) {
    if (err) {
      throw err;
    }

    var callback = this;

    options.path = '/api/secure/jsonws/group/get-group?name=Guest&companyId=' + Liferay.company.companyId;
    http.get(options, function(res) {
      var data = "";

      res.on("data", function (chunk) {
          data += chunk;
      });

      res.on("end", function () {
          Liferay.group = JSON.parse(data);
          callback(null);
      });
    });
  },
  function getLayouts(err, group) {
    if (err) {
      throw err;
    }

    var callback = this;

    options.path = '/api/secure/jsonws/layout/get-layouts?privateLayout=false&groupId=' + Liferay.group.groupId;
    http.get(options, function(res) {
      var data = "";

      res.on("data", function (chunk) {
          data += chunk;
      });

      res.on("end", function () {
          Liferay.layouts = JSON.parse(data);
          callback(null);
      });
    });
  },
  function parseTypeSettings(err) {
    if (err) {
      throw err;
    }

    var layouts = Liferay.layouts;

    var loop = function(i) {
      if (i < layouts.length) {
        var layout = layouts[i];

        var typeSettings = trim(layout.typeSettings).split('\n').sort();

        layout.columns = [];
        for (var j = 0; j < typeSettings.length; j++) {

          var typeSetting = trim(typeSettings[j]).split('=');

          if (startsWith(typeSetting[0], 'column')) {
            var column = typeSetting[1].split(',');
            layout.columns.push(column);
          }
          else if(typeSetting[0]) {
            layout[typeSetting[0]] = typeSetting[1];
          }
        }

        return process.nextTick(function() {
          loop(i+1);
        });

      }

      return null;
    };

    return loop(0);
  }
);

var trim = function(str) {
  if (!str) return null;
  return str.trim().replace(/,$/, '');
}

var startsWith = function(str, value) {
  if (!str) return false;

  return str.substring(0, value.length) === value;
}