/* eslint-disable */

module.exports.displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicG9sYW50eSIsImEiOiJjbWZpOHFnaW0waTI3MmpzZnQ5Y2Z6cTB4In0.U_EHyYbjhuHTeX3UP9O16g';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/polanty/cmfideidy003n01qrbdab1xr1',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 10,
    //style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}<p/>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
