// original authors 'aalonsog@dit.upm.es', 'prodriguez@dit.upm.es', 'jcervino@dit.upm.es'
// https://github.com/ging/licode
// I have made changes to the NuveClient as per requirements.
import { HTTP } from 'meteor/http';
import base64 from './base64';
import CryptoJS from './hmac_sha1';

const N = {};
N.base64 = base64(); // base64 encode decode

/* eslint-disable */ // :( sorry
N.API = (function (N) {
  'use strict';
  var createRoom, getRooms, getRoom, updateRoom, patchRoom,
      deleteRoom, createToken, createService, getServices,
      getService, deleteService, getUsers, getUser, deleteUser,
      params, send, calculateSignature, formatString, init;

  params = {
      service: undefined,
      key: undefined,
      url: undefined
  };

  init = function (service, key, url) {
      N.API.params.service = service;
      N.API.params.key = key;
      N.API.params.url = url;
  };

  createRoom = function (name, options, params) {

      if (!options) {
          options = {};
      }

      return send('POST', {name: name, options: options}, 'rooms', params);
  };

  getRooms = function ( params) {
      return send('GET', undefined, 'rooms', params);
  };

  getRoom = function (room, params) {
      return send('GET', undefined, 'rooms/' + room, params);
  };

  updateRoom = function (room, name, options, params) {
      return send('PUT', {name: name, options: options},
            'rooms/' + room, params);
  };

  patchRoom = function (room, name, options, params) {
      return send('PATCH', {name: name, options: options},
            'rooms/' + room, params);
  };

  deleteRoom = function (room, params) {
      return send('DELETE', undefined, 'rooms/' + room, params);
  };

  createToken = function (room, username, role, params) {
      return send('POST', undefined, 'rooms/' + room + '/tokens',
            params, username, role);
  };

  createService = function (name, key, params) {
      return send('POST', {name: name, key: key}, 'services/', params);
  };

  getServices = function (params) {
      return send('GET', undefined, 'services/', params);
  };

  getService = function (service, params) {
      return send('GET', undefined, 'services/' + service, params);
  };

  deleteService = function (service, params) {
      return send('DELETE', undefined, 'services/' + service, params);
  };

  getUsers = function (room, params) {
      return send('GET', undefined, 'rooms/' + room + '/users/', params);
  };

  getUser = function (room, user, params) {
      return send('GET', undefined, 'rooms/' + room + '/users/' + user, params);
  };

  deleteUser = function (room, user, params) {
      return send('DELETE', undefined,
            'rooms/' + room + '/users/' + user, params);
  };

  send = function (method, body, url, params, username, role) {
      var service, key, timestamp, cnounce, toSign, header, signed, req;

      if (params === undefined) {
          service = N.API.params.service;
          key = N.API.params.key;
          url = N.API.params.url + url;
      } else {
          service = params.service;
          key = params.key;
          url = params.url + url;
      }

      if (service === '' || key === '') {
          console.log('ServiceID and Key are required!!');
          return;
      }

      timestamp = new Date().getTime();
      cnounce = Math.floor(Math.random() * 99999);

      toSign = timestamp + ',' + cnounce;

      header = 'MAuth realm=http://marte3.dit.upm.es,mauth_signature_method=HMAC_SHA1';

      if (username && role) {

          username = formatString(username);

          header += ',mauth_username=';
          header +=  username;
          header += ',mauth_role=';
          header +=  role;

          toSign += ',' + username + ',' + role;
      }

      signed = calculateSignature(toSign, key);


      header += ',mauth_serviceid=';
      header +=  service;
      header += ',mauth_cnonce=';
      header += cnounce;
      header += ',mauth_timestamp=';
      header +=  timestamp;
      header += ',mauth_signature=';
      header +=  signed;

      const httpHeaders = {};
      let httpContent = null;
      httpHeaders['Authorization'] = header;

      if (body !== undefined) {
          // req.setRequestHeader('Content-Type', 'application/json');
          httpHeaders['Content-Type'] = 'application/json';
          // req.send(JSON.stringify(body));
          httpContent = JSON.stringify(body);
      }

      const result = HTTP.call(
        method,
        url,
        {
          content: httpContent,
          headers: httpHeaders,
        }
      );

      return result;

  };

  calculateSignature = function (toSign, key) {
      var hash, hex, signed;
      hash = CryptoJS.HmacSHA1(toSign, key);
      hex = hash.toString(CryptoJS.enc.Hex);
      signed = N.Base64.encodeBase64(hex);
      return signed;
  };

  formatString = function(s){
      var r = s.toLowerCase();
      var nonAsciis = {'a': '[àáâãäå]',
                        'ae': 'æ',
                        'c': 'ç',
                        'e': '[èéêë]',
                        'i': '[ìíîï]',
                        'n': 'ñ',
                        'o': '[òóôõö]',
                        'oe': 'œ',
                        'u': '[ùúûűü]',
                        'y': '[ýÿ]'};
      for (var i in nonAsciis) {
        r = r.replace(new RegExp(nonAsciis[i], 'g'), i);
      }
      return r;
  };

  return {
      params: params,
      init: init,
      createRoom: createRoom,
      getRooms: getRooms,
      getRoom: getRoom,
      updateRoom: updateRoom,
      patchRoom: patchRoom,
      deleteRoom: deleteRoom,
      createToken: createToken,
      createService: createService,
      getServices: getServices,
      getService: getService,
      deleteService: deleteService,
      getUsers: getUsers,
      getUser: getUser,
      deleteUser: deleteUser
  };
}(N));
/* eslint-enable */

export default N;
