(function () {
  window.cactusAsyncLib.register(() => {
    const endpoints = window.ResolverHandler.retrieveInjection("stats-eid");
    let endpointsArray = [];

    endpointsArray.push(endpoints.out, endpoints.in);

    let requests = endpointsArray.map(endpoint => fetch(`${endpoint}/api/countries`,
      {
        method: 'GET'
      }
    ));

    const connections = new window.ResolverHandler("getConnections");
    connections.register(() => {
      return Promise.all(requests)
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then((response) => {
          return response;
        });
    });
  });
})();
