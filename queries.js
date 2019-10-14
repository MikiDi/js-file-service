'use strict';

import { uuid, sparqlEscapeUri, sparqlEscapeString, sparqlEscapeInt, sparqlEscapeDateTime } from 'mu';
import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';

const FetchFileProperties = async function (fileProperties, graph) {
  let q = `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX dbpedia: <http://dbpedia.org/ontology/>
    
    SELECT ?uri ?physicalUri ?name ?format ?size ?extension
    WHERE {
      GRAPH ?g {
        ?uri mu:uuid ${sparqlEscapeString(fileProperties.id)};
          a nfo:FileDataObject .
        ?physicalUri nie:dataSource ?uri .
        OPTIONAL { ?uri nfo:fileName ?name . }
        OPTIONAL { ?uri dct:format ?format . }
        OPTIONAL { ?uri nfo:fileSize ?size . }
        OPTIONAL { ?uri dbpedia:fileExtension ?extension . }
      }
    }
  `;
  return query(q);
};

module.exports = {
  FetchFileProperties: FetchFileProperties
};
