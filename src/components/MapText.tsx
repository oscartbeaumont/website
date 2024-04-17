const MAPS_API_KEY = "AIzaSyBUloWqQanrvNH460EUvGUh8NgdYo2DWMA";

export function MapText() {
  return (
    <dfn title="Perth, Australia" tabindex="0">
      <button disabled>
        <iframe
          width="600"
          height="450"
          style="border:0;border-radius:0.25rem;"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=Perth+Western+Australia&zoom=4&maptype=satellite&center=-26,133`}
        ></iframe>
      </button>
    </dfn>
  );
}
