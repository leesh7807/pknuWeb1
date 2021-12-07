var url = "http://api.data.go.kr/openapi/tn_pubr_public_fshlc_api";
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + '[서비스키]'; /*Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('707'); /**/
    queryParams += '&' + encodeURIComponent('type') + '=' + encodeURIComponent('json'); /**/

    var markers = new Array();
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
    //마커 그리는 함수
    function drawMarkers(centers) {
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
        // 마커 이벤트리스너 등록
        kakao.maps.event.addListener(
          marker,
          "mouseover",
          mouseOverListener(map, marker, infoWindow)
        );
        kakao.maps.event.addListener(
          marker,
          "mouseout",
          mouseOutListener(infoWindow)
        );

        kakao.maps.event.addListener(marker, 'click', mouseClickListener(centers, i));
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

    var mapContainer = document.getElementById("map"); // 지도를 표시할 div
    var mapOption = {
      center: new kakao.maps.LatLng(36.59000, 127.52855), // 지도의 중심좌표
      level: 12, // 지도의 확대 레벨
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

    var centers = []; //api 정보를 담을 변수
    fetch(url + queryParams)
      .then((res) => res.json())
      .then((resJson) => {
        centers = resJson.response.body.items;
        drawMarkers(centers);
        clusterer.addMarkers(markers);
      });

    // 분류 함수
    function classifyMarkers() {
      // 셀렉트 박스에서 id로 value 가져오기.
      var target = document.getElementById("area");
      var areaValue = target.options[target.selectedIndex].value;
      var target = document.getElementById("type");
      var typeValue = target.options[target.selectedIndex].value;
      // 인풋 박스의 검색할 내용 가져오기
      var searching = document.getElementById('searchBox').value;
      // json 배열들
      var classifiedArea = new Array(); // 지역 분류
      var classifiedType = new Array(); // 지역 분류 + 유형 분류
      var fishingPlace = new Array(); // 지역 분류 + 유형 분류 + 검색
      // 전국이 선택될 때
      if (areaValue == "전국") {
        classifiedArea = centers; // 분류된 것이 곧 fishingPlace.
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
        classifiedType = classifiedArea; // 지역분류 된 결과 그대로
      }
      // 그 외 유형 선택
      else {
        for (var i = 0; i < classifiedArea.length; i++) {
          var type = classifiedArea[i]["fshlcType"]; // 낚시터 유형 받아오기.
          var splittedType = type.split(" "); // 스페이스바를 기준으로 배열로 저장.
          if (typeValue == splittedType[0]) {
            classifiedType.push(classifiedArea[i]);
          }
        }
      }
      // 검색이 카테고리에 영향을 받기에 classifyMarkers() 함수안에 포함시킴. 검색 시 버벅거리는 문제가 생김.
      searching = searching.replace(/[^가-힣a-zA-Z0-9]/g,"") // 정규 표현식을 사용해 한글, 영어, 숫자가 아닌 것을 모두 제외.
      searching = searching.toLowerCase(); // 영어의 경우 소문자로 통일.
      for(var i = 0; i < classifiedType.length; i++) {
        var searchData = classifiedType[i]["fshlcNm"]; // 검색하고 싶은 것은 searchData에 플러스해주면 됨.
        searchData = searchData.replace(/[^가-힣a-zA-Z0-9]/g,"")
        searchData = searchData.toLowerCase();
        /* indexOf(value); value가 null이나 undefined인 경우 undefined를 검색해 0을 반환함. api데이터가 그렇게 되어 있는 것으로 추정.
        value가 있을 때 검색에 성공하면 위치를 반환. 검색에 실패하면 -1을 반환. 
        undefined가 검색되는 경우는 검색어를 전부 지웠거나, 혹은 모음이나 자음 특수문자를 검색했을 때임.
        상기한 경우는 모든 마커를 표시해도 자연스럽다고 판단함.*/
        var isThere = searchData.indexOf(searching);
        if(isThere != -1) {
          fishingPlace.push(classifiedType[i]);
        }
      }
      // 분류를 마친 후 마커를 초기화 시킴.
      clusterer.removeMarkers(markers);
      markers = [];
      // 마커를 만들어 배열에 넣고 지도에 찍기.
      drawMarkers(fishingPlace);

      clusterer.addMarkers(markers);
    }
