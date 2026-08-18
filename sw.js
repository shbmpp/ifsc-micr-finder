const CACHE_NAME =
  "ifsc-finder-v1";


const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];


self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        cache =>
          cache.addAll(
            APP_FILES
          )
      )

    );

    self.skipWaiting();

  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
        .then(keys =>
          Promise.all(

            keys
              .filter(
                key =>
                  key !==
                  CACHE_NAME
              )

              .map(
                key =>
                  caches.delete(key)
              )

          )
        )

    );

    self.clients.claim();

  }
);


self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    /*
     * API requests:
     * Always try network first.
     */

    if (
      request.url.startsWith(
        "https://ifsclookup.in/api/"
      )
    ) {

      event.respondWith(

        fetch(request)
          .then(response => {

            const clone =
              response.clone();


            caches.open(
              CACHE_NAME
            )
            .then(cache =>
              cache.put(
                request,
                clone
              )
            );


            return response;

          })

          .catch(() =>
            caches.match(
              request
            )
          )

      );

      return;

    }


    /*
     * Website files:
     * Cache first.
     */

    event.respondWith(

      caches.match(request)
        .then(cached => {

          return (
            cached ||
            fetch(request)
          );

        })

    );

  }
);