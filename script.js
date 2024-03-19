const serviceKey = 'ONR79zouN8yrGZoF590NVx3COiRb5tZ0Y5cD1c0wD2Tt5kvuGa4avDfAhe6TIG%2FSF%2BpM%2Fpxco6QT4TgKfIUWtw%3D%3D';
const googleAPIKey = 'AIzaSyDnLiW-C1G7JKIl_-pdpN1_gB4ZRm6XYvc';

const locationBtn = document.getElementById('location-btn');
locationBtn.addEventListener('click', getUltraSrtNcst);

/** 초단기실황조회 */
async function getUltraSrtNcst() {
    locationBtn.innerText = '위치 파악 중...';
    let baseDate = getCurrentDate();
    let baseTime = getCurrentTime();
    const gridXY = await getGeolocation();
    let nx = gridXY.x;
    let ny = gridXY.y;
    let lat = gridXY.v1;
    let lng = gridXY.v2;
    let baseUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    try {
        const response = await fetch(baseUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.response.header.resultCode === '03') {
                console.error('초단기실황 No data');
            } else {
                const items = data.response.body.items.item;
                items.map((item) => {
                    if (item.category === "VEC") {
                        document.getElementById(item.category).innerText = windDirToCompass(Number(item.obsrValue));
                    } else {
                        const spanEl = document.getElementById(item.category);
                        if (spanEl !== null) {
                            document.getElementById(item.category).innerText = item.obsrValue;
                        }
                    }

                    let src = '';
                    if (item.category === 'T1H') {
                        if (item.obsrValue < 0) {
                            src = '../img/snow.jpeg';
                        } else if (item.obsrValue < 9) {
                            src = '../img/winter.jpeg'
                        } else if (item.obsrValue < 20) {
                            src = '../img/spring.jpeg';
                        } else if (item.obsrValue < 26) {
                            src = '../img/summer.jpeg';
                        } else {
                            src = '../img/hot.jpeg';
                        }

                        document.querySelector('.weather-img').setAttribute("src", src);
                    }

                    if (item.category === 'PTY') {
                        if (item.obsrValue === '1' || item.obsrValue === '5') {
                            src = '../img/rainy.jpeg'
                        }
                    }
                })
                
                locationBtn.innerText = '내 위치';

                const locationDescription = await getLocationDescription(lat, lng);
                let address = locationDescription.substring(0, locationDescription.indexOf('동') + 1);
                document.getElementById('location-info').innerText = address;
            }
        }
    } catch (error) {
        console.error(error);
    }
}
getUltraSrtNcst();

/** 단기예보조회 */
async function getVilageFcst() {
    locationBtn.innerText = '위치 파악 중...';
    let baseDate = getCurrentDate();
    let baseTime = getCurrentTime('vilage');
    const gridXY = await getGeolocation();
    let nx = gridXY.x;
    let ny = gridXY.y;
    let baseUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    try {
        const response = await fetch(baseUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.response.header.resultCode === '03') {
                console.error('No data');
            } else {
                const items = data.response.body.items.item;
                let time = '';

                items.map((item) => {
                    if (item.fcstTime !== time) {
                        time = item.fcstTime;
                        formatTime = time.slice(0, 2) + '시';
                        const thEl = document.createElement('th');
                        thEl.innerText = formatTime;
                        document.getElementById('weather-table-time').appendChild(thEl);
                    }
                    if (item.category === 'SKY') {
                        const tdEl = document.createElement('td');
                        tdEl.innerText = convertWeather(item.fcstValue);
                        document.getElementById('weather-table-sky').appendChild(tdEl);
                    }
                    if (item.category === 'TMP') {
                        const tdEl = document.createElement('td');
                        tdEl.innerText = item.fcstValue;
                        document.getElementById('weather-table-tmp').appendChild(tdEl);
                    }
                    if (item.category === 'POP') {
                        const tdEl = document.createElement('td');
                        tdEl.innerText = item.fcstValue;
                        document.getElementById('weather-table-pop').appendChild(tdEl);
                    }
                    if (item.category === 'PCP') {
                        const tdEl = document.createElement('td');
                        tdEl.innerText = item.fcstValue;
                        document.getElementById('weather-table-pcp').appendChild(tdEl);
                    }
                    if (item.category === 'WSD') {
                        const tdEl = document.createElement('td');
                        tdEl.innerText = item.fcstValue;
                        document.getElementById('weather-table-wsd').appendChild(tdEl);
                    }
                    if (item.category === 'REH') {
                        const tdEl = document.createElement('td');
                        tdEl.innerText = item.fcstValue;
                        document.getElementById('weather-table-reh').appendChild(tdEl);
                    }
                    

                    if (item.category === 'TMN' && item.fcstDate === baseDate) {
                        document.getElementById('TMN').innerText = item.fcstValue;
                    }
                    if (item.category === 'TMX' && item.fcstDate === baseDate) {
                        document.getElementById('TMX').innerText = item.fcstValue;
                    }
                })

                const weather = items[5].fcstValue;
                // const weather = '1';
                if (weather === '1') {
                    document.querySelector('.weather-icon').src = '../img/sun.png';
                    document.querySelector('#weather-summary').innerText = '맑음';
                } else if (weather === '3') {
                    document.querySelector('.weather-icon').src = '../img/cloud.png';
                    document.querySelector('#weather-summary').innerText = '구름 많음';
                } else {
                    document.querySelector('.weather-icon').src = '../img/cloudy.png';
                    document.querySelector('#weather-summary').innerText = '흐림';
                }
                document.getElementById('SKY').innerText = convertWeather(items[5].fcstValue);


                locationBtn.innerText = '내 위치';
            }
        }
    } catch (error) {
        console.error(error);
    }
}
getVilageFcst();

function getCurrentDate() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }

    const currentDate = `${year}${month}${day}`;
    return currentDate;
}

function getCurrentTime(type='') {
    const date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();

    if (type === 'vilage') {
        if (hour >= 2 && hour < 5) {
            hour = '02';
            minute = '00';
        }
        if (hour >= 5 && hour < 8) {
            hour = '05';
            minute = '00';
        }
        if (hour >= 8 && hour < 11) {
            hour = '08';
            minute = '00';
        }
        if (hour >= 11 && hour < 14) {
            hour = '11';
            minute = '00';
        }
        if (hour >= 14 && hour < 17) {
            hour = '14';
            minute = '00';
        }
        if (hour >= 17 && hour < 20) {
            hour = '17';
            minute = '00';
        }
        if (hour >= 20 && hour < 23) {
            hour = '20';
            minute = '00';
        }
        if (hour >= 23 || hour < 2) {
            hour = '23';
            minute = '00';
        }
    } else {
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '30';
            hour--;
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (hour < 0) {
                hour = 23;
            }
        } else if (minute < 30) {
            minute = '00';
        } else {
            minute = '30';
        }
    }

    const currentTime = hour + minute;
    return currentTime;
}

// 위경도를 격자 좌표로 변환하는 함수 정의
function convertLatLonToGrid(v1, v2) {
    // LCC DFS 좌표 변환을 위한 기초 자료
    const RE = 6371.00877; // 지구의 반경(단위: km)
    const GRID = 5.0; // 격자 간격(단위: km)
    const SLAT1 = 30.0; // 첫 번째 표준 위도(degree 단위)
    const SLAT2 = 60.0; // 두 번째 표준 위도(degree 단위)
    const OLON = 126.0; // 기준점의 경도(degree 단위)
    const OLAT = 38.0; // 기준점의 위도(degree 단위)
    const XO = 43; // 기준점 X 좌표(GRID 단위)
    const YO = 136; // 기준점 Y 좌표(GRID 단위)

    // 입력받은 위경도(v1, v2)를 격자 좌표로 변환하는 내부 함수
    function dfs_xy_conv(v1, v2) {
        const DEGRAD = Math.PI / 180.0; // 도(degree)를 라디안으로 변환하는 비율

        // 투영에 필요한 스케일 팩터와 오프셋 계산
        const re = RE / GRID; // 지구 반경을 격자 간격으로 나누어 축척 조정
        const slat1 = SLAT1 * DEGRAD; // 첫 번째 표준위도를 라디안으로 변환
        const slat2 = SLAT2 * DEGRAD; // 두 번째 표준위도를 라디안으로 변환
        const olon = OLON * DEGRAD; // 기준점 경도를 라디안으로 변환
        const olat = OLAT * DEGRAD; // 기준점 위도를 라디안으로 변환

        // 스케일 팩터 sn과 sf, 오프셋 ro 계산
        let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
        let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
        let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
        ro = re * sf / Math.pow(ro, sn);

        // 위경도에서 격자 좌표로의 변환 과정
        const ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5); // 변환된 위도를 기반으로 ra 계산
        const adjustedRa = re * sf / Math.pow(ra, sn); // 조정된 ra 값 계산
        let theta = v2 * DEGRAD - olon; // 변환된 경도를 기반으로 각도 theta 계산
        theta = (theta + Math.PI) % (2 * Math.PI) - Math.PI; // theta 값을 -π와 π 사이로 정규화
        theta *= sn; // 스케일 팩터를 적용한 조정된 theta 값

        // 최종 격자 좌표 x, y 계산
        const x = Math.floor(adjustedRa * Math.sin(theta) + XO + 0.5);
        const y = Math.floor(ro - adjustedRa * Math.cos(theta) + YO + 0.5);

        // 계산된 격자 좌표를 객체로 반환
        return { v1, v2, x, y };
    }

    // dfs_xy_conv 함수를 호출하여 위경도를 격자 좌표로 변환
    const rs = dfs_xy_conv(v1, v2);

    // 변환된 격자 좌표를 반환
    return rs;
}

// 위치 정보를 비동기적으로 가져오고, 성공하면 격자 좌표로 변환하여 반환하는 함수
function getGeolocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('브라우저가 위치 정보를 지원하지 않습니다.');
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const gridXY = convertLatLonToGrid(latitude, longitude);
                    resolve(gridXY); // 위치 정보를 성공적으로 가져와 격자 좌표로 변환한 결과를 resolve 합니다.
                },
                () => {
                    reject('현재 위치를 가져올 수 없습니다.'); // 위치 정보를 가져오는 데 실패한 경우 reject 합니다.
                }
            );
        }
    });
}

// getLocationDescription 함수 정의
async function getLocationDescription(lat, lng) {
    const apiKey = googleAPIKey; // Google Maps API 키를 여기에 넣으세요.
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            (data.results[0].formatted_address);
            // 첫 번째 결과의 주소를 반환
            return data.results[0].formatted_address;
        } else {
            return '위치 정보를 찾을 수 없습니다.';
        }
    } catch (error) {
        console.error('위치 정보 조회 중 오류 발생:', error);
        return '오류 발생';
    }
}

/** 풍속에 따라 바람 강도 용어 변환하는 함수 */
function windSpeedToCat(wsd) {
    if (wsd < 4) {
        return '약';
    } else if (wsd < 9) {
        return '약간 강';
    } else if (wsd < 14) {
        return '강';
    } else if (wsd >= 14) {
        return '매우 강';
    } else {
        return '-';
    }
}

/** 풍향값에 따라 16방위로 변환하는 함수 */
function windDirToCompass(vec) {
    let value = (vec + 22.5 * 0.5) / 22.5;
    value = Math.trunc(value);

    switch (value) {
        case 0:
            return 'N';
        case 1:
            return 'NNE';
        case 2:
            return 'NE';
        case 3:
            return 'ENE';
        case 4:
            return 'E';
        case 5:
            return 'ESE';
        case 6:
            return 'SE';
        case 7:
            return 'SSE';
        case 8:
            return 'S';
        case 9:
            return 'SSW';
        case 10:
            return 'SW';
        case 11:
            return 'WSW';
        case 12:
            return 'W';
        case 13:
            return "WNW";
        case 14:
            return 'NW';
        case 15:
            return 'NNW';
        case 16:
            return 'N';
        default:
            return '-';
    }
}

function convertWeather(code) {
    switch (code) {
        case '1':
            return '맑음';
        case '3':
            return '구름 많음';
        case '4':
            return '흐림';
        default:
            return '-';
    }
}