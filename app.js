"use strict";

import path from 'path';

import { app, errorHandler } from 'mu';

import { FetchFileProperties } from './queries';
import mime from 'mime-types';

var send = require('send');
var i = 1;

const GRAPH = process.env.MU_APPLICATION_GRAPH || 'http://mu.semte.ch/application';

function sharedUriToPath (uri) {
  return uri.replace('share://', '');
}

function headers (res, path, stat) {
  // serve all files for download
}

app.get('/', function (req, res) {
  res.send('Hello js-file-service');
});

app.get('/files/:id/download', function (req, res) {
  FetchFileProperties({id: req.params.id}, GRAPH)
    .then(function (result) {
      if (result.results.bindings.length > 0) {
        let fileProperties = result.results.bindings[0];
        let contentType, name, extension, created;

        // path
        let filePath = sharedUriToPath(fileProperties.physicalUri.value);

        // Content-type
        if (fileProperties.format) {
          contentType = mime.contentType(fileProperties.format);
        } else if (fileProperties.extension || path.extname(filePath)) {
          extension = fileProperties.extension || path.extname(filePath);
          contentType = mime.contentType(extension);
        }
        res.setHeader('Content-Type', contentType);

        // name
        if (req.query.name) {
          name = req.query.name;
        } else if (fileProperties.name && fileProperties.extension) {
          name = `${fileProperties.name}.${fileProperties.extension}`;
        } else {
          name = path.basename(filePath);
        }
        if (name) {
          res.set('Content-Disposition', `attachment; filename="${name}"`);
        } else {
          res.set('Content-Disposition', 'attachment');
        }

        send(req, filePath, { root: '/share' })
          .pipe(res);
      } else {
        res.status(404).end();
      }
    })
    .catch(function (err) {
      console.log(err);
      res.send("Oops something went wrong: " + JSON.stringify(err));
    });
});

app.use(errorHandler);
