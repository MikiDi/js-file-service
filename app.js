'use strict';

import path from 'path';

import mime from 'mime-types';
import send from 'send';

import { app, errorHandler } from 'mu';

import { FetchFileProperties } from './queries';

const GRAPH = process.env.MU_APPLICATION_GRAPH || 'http://mu.semte.ch/application';

function sharedUriToPath (uri) {
  return uri.replace('share://', '');
}

app.get('/files/:id/download', function (req, res, next) {
  FetchFileProperties({ id: req.params.id }, GRAPH)
    .then(function (result) {
      if (result.results.bindings.length > 0) {
        let fileProperties = result.results.bindings[0];
        let contentType, name, extension;

        // path
        let filePath = sharedUriToPath(fileProperties.physicalUri.value);

        // Content-type
        if (fileProperties.format) {
          contentType = mime.contentType(fileProperties.format);
          res.set('Content-Type', contentType);
        } else if (fileProperties.extension || path.extname(filePath)) {
          extension = fileProperties.extension || path.extname(filePath);
          contentType = mime.contentType(extension);
          res.set('Content-Type', contentType);
        }

        // name
        if (req.query.name) {
          name = req.query.name;
        } else {
          name = path.basename(filePath);
        }
        res.set('Content-Disposition', `attachment; filename="${name}"`);

        send(req, filePath, { root: '/share' })
          .pipe(res);
      } else {
        res.status(404).end();
      }
    })
    .catch(function (err) {
      next(err);
    });
});

app.use(errorHandler);
