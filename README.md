# file-service
Microservice to download files with support for [HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests.). Heavily inspired on [file-service](https://github.com/mu-semtech/file-service) (in Ruby).

## Installation
Add the following snippet to your `docker-compose.yml` to include the file service in your project.

```yaml
range-file:
  image: mikidi/js-file-service:latest
  links:
    - database:database
  volumes:
    - ./data/files:/share
```

Add a rule to `dispatcher.ex` to dispatch all download requests `/files/:id/download` to the file service. E.g. 

```elixir
  get "/files/:id/download" do
    Proxy.forward conn, [], "http://range-file/files/" <> id <> "/download"
  end
```
The host `range-file` in the forward URL reflects the name of the file service in the `docker-compose.yml` file.

More information how to setup a mu.semte.ch project can be found in [mu-project](https://github.com/mu-semtech/mu-project).

## REST API

#### GET /files/:id/download
Download the content of the file with the given id.

##### Query parameters
* `name` (optional): name for the downloaded file (e.g. `/files/1/download?name=report.pdf`)

##### Response
###### 200 OK
Returns the content of the file with the `Accept-Ranges: bytes` header set.

###### 206 OK
Returns the requested partial content of the file with the `Content-Range: bytes ...` header set.

###### 404 Bad Request
If a file with the given id cannot be found.
