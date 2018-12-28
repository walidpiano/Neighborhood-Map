$(document).ready(function(){
    var map;
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

})

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 13
    });
}
