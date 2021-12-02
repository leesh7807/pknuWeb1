var url = "http://api.data.go.kr/openapi/tn_pubr_public_fshlc_api";
var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + 'lS7kyucGJY1fq8UGLsP3lXJl%2FZlbc8i5ObPO9O5OHlmIjIfH9hSwPGROViGfC5rpa5KfdTDJheDcrc6lGYRw0A%3D%3D'; /*Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('707'); /**/
queryParams += '&' + encodeURIComponent('type') + '=' + encodeURIComponent('json'); /**/

var markers = new Array(); //마커들의 정보를 저장할 배열

// 인포윈도우 표시 열기
// 마커 마우스오버 이벤트리스너
function mouseOverListener(map, marker, infoWindow) {
  return function () {
    infoWindow.open(map, marker);
  };
}
// 인포윈도우 표시 닫기
// 마커 마우스아웃 이벤트리스너
function mouseOutListener(infoWindow) {
  return function () {
    infoWindow.close();
  };
}
// 상세정보창 출력
// 마커 클릭 이벤트리스너
function mouseClickListener(centers, i) { //마커 클릭이벤트 발생 시, 상세정보 출력함수 반환
  return function () {
    var center_name = document.getElementById("center_name");
    var center_address = document.getElementById("center_address");
    var center_callNumber = document.getElementById("center_callNumber");
    var center_cost = document.getElementById("center_cost");
    var center_fishSpecies = document.getElementById("center_fishSpecies");
    var center_safetyFacilities = document.getElementById("center_safetyFacilities");
    center_name.innerHTML = "낚시터명: " + centers[i]['fshlcNm'];
    center_address.innerHTML = "상세 주소<br>";
    if (centers[i]['rdnmadr'] != "") center_address.innerHTML += "도로명주소: " + centers[i]['rdnmadr'] + "<br>";
    if (centers[i]['lnmadr'] != "") center_address.innerHTML += "지번주소: " + centers[i]['lnmadr'];
    center_callNumber.innerHTML = "전화번호: " + centers[i]['fshlcPhoneNumber'];
    center_cost.innerHTML = "이용 요금: " + centers[i]['useCharge'];
    center_fishSpecies.innerHTML = "주요 어종: " + centers[i]['kdfsh'];
    center_safetyFacilities.innerHTML = "안전 시설: " + centers[i]['safentl'];
  }
}

//마커 생성 함수
function makeMarkers(centers) {
  for (let i = 0; i < centers.length; i++) {
    var latitude = centers[i]["latitude"];
    var longitude = centers[i]["longitude"];
    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(latitude, longitude),
      map: map,
    });

    // 인포윈도우 설정
    var infoWindow = new kakao.maps.InfoWindow({
      content: infoWindowContent(centers, i)
    });
    // 마커 추가
    markers.push(marker);
    // 마커 이벤트리스너 등록 (마우스오버)
    kakao.maps.event.addListener(
      marker,
      "mouseover",
      mouseOverListener(map, marker, infoWindow)
    );
    // 마커 이벤트리스너 등록 (마우스아웃)
    kakao.maps.event.addListener(
      marker,
      "mouseout",
      mouseOutListener(infoWindow)
    );
    // 마커 이벤트리스너 등록 (마우스클릭)
    kakao.maps.event.addListener(
      marker,
      "click",
      mouseClickListener(centers, i)
    );
  }
}

//인포윈도우 content 반환함수
function infoWindowContent(centers, i) {
  var contentAddress = "";
  if (centers[i]['rdnmadr'] != "" && centers[i]['rdnmadr'] != null) contentAddress += "도로명주소: " + centers[i]['rdnmadr'] + "<br>";
  if (centers[i]['lnmadr'] != "" && centers[i]['lnmadr'] != null) contentAddress += "지번주소: " + centers[i]['lnmadr'];

  var content =
    '<div class="wrap">' +
    '    <div class="title">낚시터 정보</div>' +
    '    <div class="body">' +
    '        <div class="desc">' +
    '            <div class="ellipsis">' + centers[i]["fshlcNm"] + '</div>' +
    '            <div class="jibun ellipsis">' + contentAddress + '</div>' +
    '            <div class="jibun ellipsis">' + centers[i]["fshlcPhoneNumber"] + '</div>'
  "          </div>" +
    "    </div>" +
    "</div>";
  return content;
}

///////////////////////////////////////////////////////
//현재 오류있음 마커 뜬 이후에 위치정보수정하면 반영안됨
var gpsAllow; //GPS 사용가능 여부를 저장할 변수
var currentLat = 37.541; //현재 위도 정보를 저장할 변수 (초기값: 서울)
var currentLng = 126.986; //현재 경도 정보를 저장할 변수 (초기값: 서울)

//현재 위치 정보를 받아오는 함수
function getLocation() {
  if (navigator.geolocation) { //GPS 사용가능시 호출
    navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationFail);////////////////이벤트형식?
  } else { //GPS 사용불가시 호출
    alert('[경고]\n위치 정보를 받아오는 데 실패하였습니다.\n서울을 기준으로 한 지도를 표출합니다.');
    gpsAllow = false; //GPS 사용 불가능
  }
}

//위치 정보 접근 성공시 실행
function getLocationSuccess(position) {
  //위치 정보 얻어오기 성공
  //현재 위치 정보를 저장
  currentLat = position.coords.latitude;
  currentLng = position.coords.longitude;
  gpsAllow = true; //GPS 사용 가능
}

//위치 정보 접근중 오류 발생시 실행
function getLocationFail(error) {
  switch (error.code) {
    case 1: //사용자가 접근거부
      alert("[경고]\n위치 정보 수집을 거절하셨습니다.\n서울을 기준으로 한 지도를 표출합니다.");
      break;
    case 2: //위치정보 사용불가
      alert("[경고]\n위치 정보를 받아오는 데 실패하였습니다.\n서울을 기준으로 한 지도를 표출합니다.");
      break;
    case 3: //시간초과
      alert("[경고]\n사용자 입력 시간 초과입니다.\n서울을 기준으로 한 지도를 표출합니다.");
      break;
  }
  gpsAllow = false; //GPS 사용 불가능
}

getLocation();

//gps 버튼
function gpsButton(){ 
  // if(gpsAllow == false) getLocation(); //작동 어떻게 할지?////////////////////////
  map.panTo(new kakao.maps.LatLng(currentLat, currentLng)); //현재 위치로 지도 중심좌표 이동
}

/////////////////////////////////////////////////////////////////////////

//로딩창
function hideLoadingPage(){
  var loading_page = document.getElementById("loading_page");
  loading_page.style.display = "none";
}

////////////////////////////////////////////////////////////////////////////

// //지역 선택시 맵 이동
// function moveArea(areaValue){
//   switch(areaValue){
//     case "전국":
//       map.panTo(new kakao.maps.LatLng(37.541, 126.986)); //현재 위치로 지도 중심좌표 이동
//       map.setLevel(11);
//       break;
//   }
// }


var mapContainer = document.getElementById("map"); // 지도를 표시할 div
var mapOption = {
  center: new kakao.maps.LatLng(currentLat, currentLng), // 초기 지도의 중심좌표는 서울
  level: 9, // 지도의 확대 레벨
};
var map = new kakao.maps.Map(mapContainer, mapOption);
map.setMaxLevel(13); // 이게 최대로 축소할 수 있는 크기
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
kakao.maps.event.addListener(map, "zoom_changed", function () {
  var level = map.getLevel();
  if (level == 13) map.setDraggable(false);
  else map.setDraggable(true);
});
var clusterer = new kakao.maps.MarkerClusterer({
  map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
  averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
  minLevel: 5, // 클러스터 할 최소 지도 레벨
});

var centers = []; //api 정보를 담을 배열
fetch(url + queryParams)
  .then((res) => res.json())
  .then((resJson) => {
    centers = resJson.response.body.items;
    makeMarkers(centers);
    clusterer.addMarkers(markers);
    if (gpsAllow) //사용자 위치정보를 받아왔을 시
      map.panTo(new kakao.maps.LatLng(currentLat, currentLng)); //현재 위치로 지도 중심좌표 이동
    hideLoadingPage();
  });

// 마커 분류 함수
function classifyMarkers() {
  // 셀렉트 박스에서 id로 value 가져오기.
  var target = document.getElementById("area");
  var areaValue = target.options[target.selectedIndex].value;
  var target = document.getElementById("type");
  var typeValue = target.options[target.selectedIndex].value;
  var classifiedArea = new Array();
  var classifiedFishingPlace = new Array(); // 분류된 centers가 저장될 json 배열.
  // 분류 알고리즘
  // 전국이 선택될 때
  if (areaValue == "전국") {
    classifiedArea = centers; // 전체 낚시터 표출
  }
  // 그 외 지역 선택
  else {
    for (var i = 0; i < centers.length; i++) {
      var area = centers[i]["lnmadr"]; // 지번주소 받아오기.
      var splittedArea = area.split(" "); // 스페이스바를 기준으로 배열로 저장.
      if (areaValue == splittedArea[0]) { // 배열의 첫 요소는 곧 지역명.
        classifiedArea.push(centers[i]);
      }
    }
  }
  if (typeValue == "전체") {
    classifiedFishingPlace = classifiedArea; // 지역분류 된 결과 그대로
  }
  // 그 외 유형 선택
  else {
    for (var i = 0; i < classifiedArea.length; i++) {
      var type = classifiedArea[i]["fshlcType"]; // 낚시터 유형 받아오기.
      var splittedType = type.split(" "); // 스페이스바를 기준으로 배열로 저장.
      if (typeValue == splittedType[0]) {
        classifiedFishingPlace.push(classifiedArea[i]);
      }
    }
  }

  // moveArea(areaValue); // 현재 지역으로 지도 옮김

  // 분류를 마친 후 기존 마커 삭제 및 초기화
  clusterer.removeMarkers(markers);
  markers = [];

  // 새 마커 생성 후 지도에 표시
  makeMarkers(classifiedFishingPlace);
  clusterer.addMarkers(markers);
}
