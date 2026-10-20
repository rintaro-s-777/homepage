//===============================================================
// メニュー制御用の関数とイベント設定（※バージョン2026-4｜オーバーレイ対応版）
//===============================================================
$(function(){
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const $overlay = $('#menubar-overlay');
  const breakPoint = 900;	// ここがブレイクポイント指定箇所です

  // ▼ここを切り替えるだけで 2パターンを使い分け！
  //   false → “従来どおり”
  //   true  → “ハンバーガーが非表示の間は #menubar も非表示”
  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0) ||
                       (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // メニューを閉じる共通関数
  // ※ハンバーガー解除・メニュー非表示・オーバーレイ非表示・
  //   noscroll解除・ドロップダウン閉じ を一括で行う
  //-------------------------------------------------
  function closeMenu() {
    $menubarHdr.removeClass('ham');
    $menubar.hide();
    $overlay.hide();
    $menubar.find('.ddmenu_parent ul').hide();
    $('body').removeClass('noscroll');
  }

  //-------------------------------------------------
  // メニューを開く共通関数
  //-------------------------------------------------
  function openMenu() {
    $menubarHdr.addClass('ham');
    $menubar.show();
    $overlay.show();
    $menubar.find('.ddmenu_parent ul').hide();
    if ($(window).width() < breakPoint) {
      $('body').addClass('noscroll');
    }
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    // ドロップダウンメニューが存在するliにクラス追加
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    // 子メニューは初期状態で閉じる（ちらつき防止）
    $menu.find('.ddmenu_parent ul').hide();

    // 万一の再初期化に備えてイベントを解除（多重バインド防止）
    $menu.find('.ddmenu').off('click.ddmenu');
    $menu.find('.ddmenu_parent').off('mouseenter.ddmenu mouseleave.ddmenu');

    //---------------------------------------------
    // ▼ブレイクポイント未満（開閉メニュー時）は
    //   PCでも「クリックで開閉」に統一（hover無効）
    //---------------------------------------------
    $menu.find('.ddmenu').on('click.ddmenu', function(e) {
      if (!isTouch && $(window).width() >= breakPoint) return; // PC大画面はhover運用

      e.preventDefault();
      e.stopPropagation();

      const $dropdownMenu = $(this).siblings('ul');
      if ($dropdownMenu.is(':visible')) {
        $dropdownMenu.hide();
      } else {
        $menu.find('.ddmenu_parent ul').hide(); // 他を閉じる
        $dropdownMenu.show();
      }
    });

    //---------------------------------------------
    // ▼PC大画面（breakPoint以上）のみ hover で開閉
    //---------------------------------------------
    $menu.find('.ddmenu_parent').on('mouseenter.ddmenu', function() {
      if (isTouch) return;
      if ($(window).width() < breakPoint) return; // 開閉メニュー時はhover無効
      $(this).children('ul').show();
    }).on('mouseleave.ddmenu', function() {
      if (isTouch) return;
      if ($(window).width() < breakPoint) return; // 開閉メニュー時はhover無効
      $(this).children('ul').hide();
    });
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger) {
    let isAnimating = false;	// 連打防止用フラグ
    $hamburger.on('click', function() {
      if (isAnimating) return;	// アニメーション中は何もしない
      isAnimating = true;

      if ($(this).hasClass('ham')) {
        // 開いている → 閉じる
        closeMenu();
      } else {
        // 閉じている → 開く
        openMenu();
      }

      // メニューのCSSアニメーション(0.2s)完了後にロック解除
      setTimeout(function() { isAnimating = false; }, 300);
    });
  }

  //-------------------------------------------------
  // オーバーレイクリックでメニューを閉じる
  //-------------------------------------------------
  $overlay.on('click', function() {
    closeMenu();
  });

  //-------------------------------------------------
  // レスポンシブ時の表示制御 (リサイズ時)
  //-------------------------------------------------
  const handleResize = debounce(function() {
    const windowWidth = $(window).width();

    // bodyクラスの制御 (small-screen / large-screen)
    if (windowWidth < breakPoint) {
      $('body').removeClass('large-screen').addClass('small-screen');
    } else {
      $('body').removeClass('small-screen').addClass('large-screen');
      // PC表示になったら、ハンバーガー解除 + メニュー・オーバーレイを閉じる
      $menubarHdr.removeClass('ham');
      $menubar.find('.ddmenu_parent ul').hide();
      $overlay.hide();
      $('body').removeClass('noscroll');

      // ▼ #menubar を表示するか/しないかの切り替え
      if (HIDE_MENUBAR_IF_HDR_HIDDEN) {
        $menubarHdr.hide();
        $menubar.hide();
      } else {
        $menubarHdr.hide();
        $menubar.show();
      }
    }

    // スマホ(ブレイクポイント未満)のとき
    if (windowWidth < breakPoint) {
      $menubarHdr.show();
      if (!$menubarHdr.hasClass('ham')) {
        $menubar.hide();
        $overlay.hide();
        $('body').removeClass('noscroll');
      }
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  // 1) ドロップダウン初期化 (#menubar)
  initDropdown($menubar, isTouchDevice);

  // 2) ハンバーガーメニュー初期化 (#menubar_hdr)
  initHamburger($menubarHdr);

  // 3) レスポンシブ表示の初期処理 & リサイズイベント
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント
  //-------------------------------------------------
  $menubar.find('a[href^="#"]').on('click', function() {
    // ドロップダウンメニューの親(a.ddmenu)のリンクはメニューを閉じない
    if ($(this).hasClass('ddmenu')) return;

    // スマホ表示＆ハンバーガーが開いている状態なら閉じる
    if ($menubarHdr.is(':visible') && $menubarHdr.hasClass('ham')) {
      closeMenu();
    }
  });

  //-------------------------------------------------
  // 「header nav」など別メニューにドロップダウンだけ適用したい場合
  //-------------------------------------------------
  // 例：header nav へドロップダウンだけ適用（ハンバーガー連動なし）
  //initDropdown($('header nav'), isTouchDevice);
});


//===============================================================
// スムーススクロール（※バージョン2025-3）
// 通常タイプ / fixedヘッダー対応 切り替え版
//===============================================================
$(function() {

    //===========================================================
    // 設定
    //===========================================================
    // 'normal' ＝ 通常タイプ（固定ヘッダーなし）
    // 'fixed' ＝ fixedヘッダー対応
    var scrollType = 'fixed';

    // fixedヘッダー時に位置計算に使う要素（※fixed版を使う際は必ずチェック。画面上部に貼り付くブロックを指定する。）
    // 例：'header' / '#header' / '.site-header'
    var fixedHeaderSelector = 'header';

    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');

    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';


    //===========================================================
    // fixedヘッダーぶんの補正値を取得
    //===========================================================
    function getHeaderOffset() {

        // 通常タイプなら補正なし
        if(scrollType !== 'fixed') {
            return 0;
        }

        // 指定要素を取得
        var $header = $(fixedHeaderSelector);

        // 要素がなければ補正なし
        if(!$header.length) {
            return 0;
        }

        // 画面上でのヘッダー下端位置を取得
        // 高さ + 上部の余白(topやmarginで見た目上ずれている分)も含めて見られる
        var rect = $header.get(0).getBoundingClientRect();

        // 念のためマイナスは0にする
        return Math.max(0, rect.bottom);
    }


    //===========================================================
    // スムーススクロール本体
    //===========================================================
    function smoothScroll(target) {

        var scrollTo = 0;

        // '#' の場合はページ最上部へ
        if(target === '#') {
            scrollTo = 0;

        } else {

            // スクロール先の要素を取得
            var $target = $(target);

            // 対象が存在しない場合は何もしない
            if(!$target.length) {
                return;
            }

            // 通常位置から、fixedヘッダー分を引く
            scrollTo = $target.offset().top - getHeaderOffset();

            // 0未満にならないように補正
            if(scrollTo < 0) {
                scrollTo = 0;
            }
        }

        // アニメーションでスムーススクロール
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

	//===========================================================
	// ページ内リンク / ページトップボタン
	//===========================================================
	$('a[href^="#"], .pagetop').click(function(e) {

		// hrefが無い.pagtopでも '#' 扱いにする
		var id = $(this).attr('href') || '#';

		// .pagetop 以外の href="#" は無視（その場に止める）
		if(id === '#' && !$(this).hasClass('pagetop')) {
			e.preventDefault();
			return;
		}

		e.preventDefault();
		smoothScroll(id);
	});

    //===========================================================
    // ページトップボタンの表示切り替え
    //===========================================================
    $(topButton).hide();

    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) {
            $(topButton).fadeIn().addClass(scrollShow);
        } else {
            $(topButton).fadeOut().removeClass(scrollShow);
        }
    });


    //===========================================================
    // ハッシュ付きURLで開いた時
    //===========================================================
    if(window.location.hash) {
        $('html, body').scrollTop(0);

        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 500);
    }

});


//===============================================================
//	ヘッダー（少しスクロールしたら背景を付ける）
//===============================================================
$(function(){

	var $header = $('header');

	function headerCheck(){
		if($(window).scrollTop() > 50){	/*50pxスクロールしたら背景を付ける*/
			$header.addClass('is-scrolled');
		} else {
			$header.removeClass('is-scrolled');
		}
	}

	$(window).on('scroll resize', headerCheck);
	headerCheck();

});


//===============================================================
//	mainimg（スクロールに連動して動く動画）
//===============================================================
$(function(){

	$('.mainimg').each(function(){

		var $wrap     = $(this);
		var $canvas   = $wrap.find('canvas');
		var $hint     = $wrap.find('.mainimg-hint');
		var $loading  = $wrap.find('.mainimg-loading');
		var $loadNum  = $loading.find('span');
		var $prog     = $('.mainimg-progress');	/*進捗バーは画面下に固定する為、動画エリアの外に置いています*/
		var $progBar  = $('.mainimg-progress-bar');

		var total     = parseInt($wrap.attr('data-frames'), 10) || 1;	/*コマ画像の枚数*/
		var path      = $wrap.attr('data-path') || 'images/frames/';	/*コマ画像が入っているフォルダ*/
		var scrollLen  = parseFloat($wrap.attr('data-scroll-length')) || 300;	/*映像が最後まで進むスクロール量（画面の高さを100とした数値）*/
		var $end      = $wrap.find('[data-movie-end]');	/*映像を止める位置の目印。htmlでdata-movie-endを付けたブロック。*/
		var ctx       = $canvas[0].getContext('2d');

		var images    = [];
		var loaded    = 0;
		var nowFrame  = -1;
		var ticking   = false;

		/* コマ画像のファイル名（001.webp、002.webp…）を作る */
		function framePath(i){
			var num = String(i + 1);
			while(num.length < 3){ num = '0' + num; }
			return path + num + '.webp';
		}

		/* 読み込みが終わるまで、映像の上のコンテンツを隠しておく */
		$wrap.addClass('is-loading');

		/* コマ画像を全部読み込む */
		for(var i = 0; i < total; i++){
			var img = new Image();
			img.onload = img.onerror = function(){
				loaded++;
				$loadNum.text(Math.round(loaded / total * 100));
				if(loaded === total){
					$loading.addClass('is-done');
					$wrap.removeClass('is-loading');
					nowFrame = -1;
					update();
				}
			};
			img.src = framePath(i);
			images.push(img);
		}

		/* canvasを画面いっぱいのサイズに合わせる */
		function resize(){
			var dpr = Math.min(window.devicePixelRatio || 1, 2);	/*画面の細かさ。2倍までに制限。*/
			$canvas[0].width  = $canvas[0].clientWidth * dpr;
			$canvas[0].height = $canvas[0].clientHeight * dpr;
			nowFrame = -1;
			update();
		}

		/* コマ画像を1枚描く（画面いっぱいに広げて、はみ出す分は切り取り） */
		function draw(index){
			var img = images[index];
			if(!img || !img.complete || !img.naturalWidth){ return; }

			var cw = $canvas[0].width;
			var ch = $canvas[0].height;
			var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
			var w = img.naturalWidth * scale;
			var h = img.naturalHeight * scale;

			ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
		}

		/* スクロール処理 */
		function update(){

			ticking = false;

			var wrapTop    = $wrap.offset().top;
			var wrapHeight = $wrap.outerHeight();
			var scrollY    = $(window).scrollTop();
			var viewH      = $(window).height();

			/* セクション内にいるかどうか */
			var inSection = (scrollY >= wrapTop) && (scrollY <= wrapTop + wrapHeight - viewH);

			/* 進捗バーの表示切替 */
			if(inSection){
				$prog.addClass('is-visible');
			} else {
				$prog.removeClass('is-visible');
			}

			/* 映像が最後まで進むスクロール量を決める。
			   目印（data-movie-end）が付いたブロックがあれば、そのブロックの上端まで。
			   目印が無ければ、data-scroll-lengthの数字（画面の高さを100とした値）を使います。 */
			var movieRange;
			if($end.length){
				movieRange = $end.offset().top - wrapTop;
			} else {
				movieRange = viewH * scrollLen / 100;
			}
			if(movieRange < 1){ movieRange = 1; }	/*0での割り算を防ぐ為の保険*/

			/* 映像の進み具合を0〜1の数値にする。
			   1になると最後のコマで、そこから先は最後のコマで止まったままになります。 */
			var scrollAmount = scrollY - wrapTop;
			var progress     = Math.max(0, Math.min(1, scrollAmount / movieRange));

			/* 何枚目のコマ画像を表示するか決めて描画 */
			var frame = Math.min(total - 1, Math.floor(progress * total));
			if(frame !== nowFrame){
				nowFrame = frame;
				draw(frame);
			}

			/* スクロールの案内は、動き始めたら消す */
			if(progress > 0.02){
				$hint.addClass('is-hidden');
			} else {
				$hint.removeClass('is-hidden');
			}

			/* 進捗バー更新（動画エリア全体のどこまで進んだかを表示） */
			var areaProgress = Math.max(0, Math.min(1, scrollAmount / (wrapHeight - viewH)));
			$progBar.css('width', (areaProgress * 100) + '%');
		}

		/* スクロール中は、画面の更新に合わせて処理する（動きをなめらかにする指定） */
		$(window).on('scroll', function(){
			if(!ticking){
				ticking = true;
				requestAnimationFrame(update);
			}
		});

		$(window).on('resize', resize);

		resize();

	});

});


//===============================================================
//	movie1（画面内に入るとループ再生する動画）
//===============================================================
$(function(){

	/*端末側で「動きを減らす」設定になっている場合は、自動再生しません*/
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$('.movie1 video').each(function(){

		var video = this;

		/*画面内に入ったら再生、画面から外れたら一時停止（jquery.inviewを利用しています）*/
		$(video).on('inview', function(event, isInView){
			if(isInView && !reduceMotion){
				var playing = video.play();
				/*ブラウザ側で自動再生が止められた場合のエラー表示を防ぐ指定*/
				if(playing && playing.catch){ playing.catch(function(){}); }
			} else {
				video.pause();
			}
		});

	});

});
