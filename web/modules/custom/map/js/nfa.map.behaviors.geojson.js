(function () {
  nfa.map.behaviors.geojson = {
    attach: function (instance) {
      if (drupalSettings.farm_map[instance.target].geojson) {
        var layers = drupalSettings.farm_map[instance.target].urls;

        for (let index = 0; index < layers.length; ++index) {
          const element = layers[index];

          if (element.type === 'group') {
            var groupLayer = instance.addLayer('group', {
              title: element.title ?? Drupal.t('Group'),
              fold: true,
            });
          }
          else {
            var url = new URL(element.url, window.location.origin + drupalSettings.path.baseUrl)

            var newLayer = instance.addLayer('geojson', {
              title: element.title ?? Drupal.t('geoJSON'),
              url,
              color: element.color ?? 'orange',
              group: element.group ?? '',
            });
          }
        }

        var source = newLayer.getSource()
        source.on('change', function () {
          instance.zoomToVectors()
        })
      }
    }
  }
}())
