var 장바구니 = null;
var result = 0;

/*날짜 포맷*/
function pad(num) {
    return num.toString().padStart(2, '0'); // 한 자리 수면 앞에 0 붙이기
}

function 현재시간(){
    const now = new Date();
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const date = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const formattedTime = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    return formattedTime;
}

/*장바구니에 상품 추가시 변경*/
function 장바구니확인(){
    if(장바구니 == null){
        $('.cart h5').remove();
        $('.cart-container').css('height', "600px");
        $('.cart').css('height', "80%");
        장바구니 = 1;
}}

/*장바구니에 담은 상품 가격 합계 출력*/
function 장바구니가격(){
    var price, quantity;
    result = 0;

    $.get('./store.json')
    .done(function(data){
        var products = data.products;
        for(let i = 0; i < products.length; i++){
            price = $(`.cart .item${i} input`).val();
            quantity = $(`.cart .item${i} p`).eq(1).text();
            if(!isNaN(price) && !isNaN(quantity)){
                result += price*quantity;
            }
        }
        $('.cart-price p').html("").html(`합계 : ${result}`);
    })
}

/*상품 정보 출력*/
function 상품정보(data){
    $('.container .row').html("");

    data.forEach(function(item, i){
        var 템플릿 = `<div class="col">
                        <div class="card item${item.id}" style="width: 18rem;" draggable=true>
                            <img src="./img/${item.photo}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${item.title}</h5>
                                <p class="card-text">${item.brand}</p>
                                <p class="card-text">가격 : ${item.price}</p>
                                <button class="btn btn-primary">담기</button>
                            </div>
                        </div>
                    </div>`;
        
        $('.container .row').append(템플릿);
    })
}

/*장바구니에 상품 추가*/
function contain(id){
    $.get('./store.json')
    .done(function(data){
        data.products.forEach(function(item){
            if(`item${item.id}`== id){
                if($(`.item${item.id}`).length == 1){
                    var 템플릿 = `
                        <div class="card item${item.id} center" style="width: 18rem; height: 90%">
                            <img src="./img/${item.photo}" class="card-img-top;" height=200px>
                            <div class="card-body">
                                <h5 class="card-title">${item.title}</h5>
                                <p class="card-text">${item.brand}</p>
                                <p class="card-text">${item.price}</p>
                                <input type='number' class='quantity' value=1>
                                <button class="btn btn-danger" id="btn-del">삭제</button>
                            </div>
                        </div>`;
                    $('.cart').append(템플릿);
                }
                else{ /*상품이 존재하면 수량만 증가*/
                    var currentVal = parseInt($(`.item${item.id} input`).val());
                    if (isNaN(currentVal)){currentVal = 0;} /*수량이 빈칸일 경우 0으로*/
                    $(`.item${item.id} input`).val(currentVal + 1);
                }
                장바구니가격();
            }
        })
    });
}

/*처음 상품 출력*/
$.get('./store.json')
.done(function(data){
    상품정보(data.products);
})

/*상품 검색*/
$('.search').on('input', function(){
    var dataName = $('.search').val();

    $.get('./store.json')
    .done(function(data){
        var products = data.products;
        var newArr = [];

        if(dataName == ""){ /*빈칸이 되면 상품 데이터 전부 전달*/
            $('.no-match').addClass('hide');
            상품정보(products);
        }
        else{ /*상품 데이터 이름 비교 및 데이터 뽑아서 전달*/
            $('.no-match').addClass('hide');
            products.forEach(function(item){
                if(item.title.includes(dataName)){
                    item.title = item.title.replace( /*검색어 부분 노라색으로 배경 강조*/
                        new RegExp(dataName, 'gi'), `<span style="background: yellow">${dataName}</span>`)
                    newArr.push(item);
                }
            })
            if(newArr.length == 0){$('.no-match').removeClass('hide');}
            else{$('.no-match').addClass('hide');}
            상품정보(newArr);
        }
    })
})


window.onload = function(){
    /*drag and drop*/
    $('.card').on('dragstart', function(e){
        e.originalEvent.dataTransfer.setData('id', e.target.classList[1]);
    })
    
    $('.cart').on({
        'dragover': function(e){
            e.preventDefault();
        },
        'drop': function(e){
            e.preventDefault();
            장바구니확인();
            contain(e.originalEvent.dataTransfer.getData('id'));
        }
    });

    /*담기 버튼 클릭*/
    $('.card button').on('click', function(e){
        장바구니확인();
        var productId = e.target.parentElement.parentElement.classList[1];
        contain(productId);
    });

    /*수량 변경시*/
    $(document).on('input', '.quantity', function(e){
        if(e.target.value <= 0){e.target.value = 1;} /*장바구니 최소 수량은 1개*/
        else{
            장바구니가격();
        }
    })

    /*삭제 버튼 클릭시 상품 장바구니에서 삭제*/
    $(document).on('click', '#btn-del', function(e){
        $(`.cart .${e.target.parentElement.parentElement.classList[1]}`).remove();
        장바구니가격();
    })

    /*전화번호 하이픈 자동 추가*/
    $(document).on('input', '#phone', function (e) {
        let phone = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 남김

        if (phone.length < 4) {
            $(this).val(phone);
        } else if (phone.length < 8) {
            $(this).val(phone.slice(0, 3) + '-' + phone.slice(3));
        } else {
            $(this).val(phone.slice(0, 3) + '-' + phone.slice(3, 7) + '-' + phone.slice(7, 11));
        }
    });
}

$('#buy').on('click', function(){
    var name = $('#name').val().trim();
    var phone = $('#phone').val().trim();

    /*성함, 전화번호 입력 및 형식 확인*/
    if(name == '' || phone == ''){
        alert('성함 또는 연락처를 작성해주세요');
    }
    else if(!/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)){
        alert('전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678');
    }
    else{
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();

        var product, company, price, quantity;
        let i;
        var canvas = document.getElementById('canvas'); 
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        var c = canvas.getContext('2d');
        var d = canvas.getContext('2d');
        d.font = '30px dotum';
        c.font = '20px dotum';
        d.fillText('영수증', 30, 20);
        c.fillText(현재시간(), 30, 50)

        if(result > 0){
            $('.canvas-container').removeClass('hide');
            for(i = 0; i < $('.cart .card').length; i++){
                product = $(`.cart .item${i} h5`).text();
                company = $(`.cart .item${i} p`).eq(0).text();
                price = $(`.cart .item${i} p`).eq(1).text();
                quantity = $(`.cart .item${i} input`).val();
                
                c.fillText(product, 30, 110+(180*i));
                c.fillText(company, 30, 140+(180*i));
                c.fillText(`가격 : ${price}`, 30, 170+(180*i));
                c.fillText(`수량 : ${quantity}`, 30, 200+(180*i));
                c.fillText(`합계 : ${price*quantity}`, 30, 230+(180*i));
                c.fillText('------------------------', 30, 260+(180*i));
            }

            c.fillText(`총 합계 : ${result}`, 30, 200+(160*i));
        }
        else{
            alert('장바구니에 담긴 상품이 없습니다.');
        }
    }
})

$('#canvas-button').on('click', function(){
    $('.canvas-container').addClass('hide');
})