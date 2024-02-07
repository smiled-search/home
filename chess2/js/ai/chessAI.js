
// bug : 表示此处还有未改善的bug
// better : 表示此处还有改善的余地.
// error : 表示此处还有为修正的错误.


//双方必须为blue或者red

/**
 * 创建活动
 * @ 
 * @param {Object} 
 * @return {Object} 实例
 * @author kongbo | kongbo@staff.sina.com.cn
 * @example

 	get : 获取ai的下一步走法, 
 	backNext: 返回下一步走法.
 * 
 */
/**
 * 进一步封装core.util.listener, 增加白名单策略, 避免在项目中, 广播混乱
* @author FlashSoft | fangchao@staff.sina.com.cn
* @changelog WK | wukan@ move to common folder
* @changelog Finrila | wangzheng4@ add data_cache_get 
 */
STK.register('common.listener', function($){
	var listenerList = {};
	var that = {};
	/**
	 * 创建广播白名单
	 * @param {String} sChannel
	 * @param {Array} aEventList
	 */
	that.define = function(sChannel, aEventList){
		if (listenerList[sChannel] != null) {
			throw 'common.listener.define: 频道已被占用';
		}
		listenerList[sChannel] = aEventList;
		
		var ret = {};
		ret.register = function(sEventType, fCallBack){
			if (listenerList[sChannel] == null) {
				throw 'common.listener.define: 频道未定义';
			}
			$.listener.register(sChannel, sEventType, fCallBack);
		};
		ret.fire = function(sEventType,oData){
			if (listenerList[sChannel] == null) {
				throw 'commonlistener.define: 频道未定义';
			}
			$.listener.fire(sChannel, sEventType, oData);
		};
		ret.remove = function(sEventType, fCallBack){
			$.listener.remove(sChannel, sEventType, fCallBack);
		};
		
		/**
		 * 使用者可以在任意时刻获取到listener缓存的(某频道+事件)最后一次触发(fire)的数据；如果没有fire过为undefined;
		 * @method cache 
		 * @param {String} sEventType
		 */
		ret.cache = function(sEventType){
			return $.listener.cache(sChannel, sEventType);
		};
		return ret;
	};
	
	// that.register = function(sChannel, sEventType, fCallBack){
	// 		if (listenerList[sChannel] == null) {
	// 			throw 'common.listener.define: 频道未定义';
	// 			
	// 		}
	// 		$.core.util.listener.register(sChannel, sEventType, fCallBack);
	// 	};
	// 	that.fire = function(sChannel, sEventType, oData){
	// 		if (listenerList[sChannel] == null) {
	// 			throw 'commonlistener.define: 频道未定义';
	// 		}
	// 		$.core.util.listener.fire(sChannel, sEventType, oData);
	// 	};
	// 	that.conn = function(){
	// 	
	// 	};
	return that;
});
;

STK.register('chess.link', function(STK){
	var space=['getNext','backNext'];
	return STK.common.listener.define("chess.link",space);
});;

STK.register('ai.chessai', function(abc){
    // ++++常量定义区+++++++++++

    // var chessState=[
    // 	{
	   //  	change:{
	   //  		node:node,
	   //  		from:{
	   //  			top:top,
	   //  			left:left
	   //  		},
	   //  		to:{
	   //  			top:top,
	   //  			left:left
	   //  		}
	   //  	},
	   //  	chessBoard:[[{chess:'car',is:'blue'},
	   //  			 	 {chess:'horse',is:'blue'},
	   //  			 	 {chess:'elephant',is:'blue'},
	   //  			 	 {chess:'noble',is:'blue'},
	   //  			 	 {chess:'general',is:'blue'},
	   //  			 	 {chess:'noble',is:'blue'},
	   //  			 	 {chess:'elephant',is:'blue'},
	   //  			 	 {chess:'horse',is:'blue'},
	   //  			 	 {chess:'car',is:'blue'}],
	   //  				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],
	   //  				[    0   ,   0   ,   {chess:'gun',is:'blue'}  ,   0   ,    0    ,   0   ,   {chess:'gun',is:'blue'}  ,   0   ,    0   ],
	   //  				[{chess:'ranker',is:'blue'},   0   ,
	   //  				{chess:'ranker',is:'blue'}  ,   0   , 
	   //  				{chess:'ranker',is:'blue'},   0   , 
	   //  				{chess:'ranker',is:'blue'} ,   0   ,
	   //  				{chess:'ranker',is:'blue'}],
	   //  				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],

	   //  				/*				楚河									汉界					   */

	   //  				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],
	   //  				[{chess:'ranker',is:'blue'},   0   , 
	   //  				{chess:'ranker',is:'blue'} ,   0   , 
	   //  				{chess:'ranker',is:'blue'},   0   , 
	   //  				{chess:'ranker',is:'blue'} ,   0   ,
	   //  				{chess:'ranker',is:'blue'}],
	   //  				[    0   ,   0   ,   {chess:'gun',is:'blue'}  ,   0   ,    0    ,   0   ,   {chess:'gun',is:'blue'}  ,   0   ,    0   ],
	   //  				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],
	   //  				[{chess:'car',is:'blue'} ,
	   //  				{chess:'horse',is:'blue'},
	   //  				{chess:'elephant',is:'blue'},
	   //  				{chess:'noble',is:'blue'},
	   //  				{chess:'general',is:'blue'},
	   //  				{chess:'noble',is:'blue'},
	   //  				{chess:'elephant',is:'blue'},
	   //  				{chess:'horse',is:'blue'},
	   //  				{chess:'car',is:'blue'} ]],
	   //  	prev:null,
	   //  	nextStat:[{	//按照change变化，以后的棋盘状态
			 //    	change:{
			 //    		node:node,
			 //    		from:{
			 //    			top:top,
			 //    			left:left
			 //    		},
			 //    		to:{
			 //    			top:top,
			 //    			left:left
			 //    		}
			 //    	},
			 //    	chessBoard:[[  'car' ,'horse','elephant','noble','general','noble','elephant','horse',  'car' ],
			 //    				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],
			 //    				[    0   ,   0   ,   'gun'  ,   0   ,    0    ,   0   ,   'gun'  ,   0   ,    0   ],
			 //    				['ranker',   0   , 'ranker' ,   0   , 'ranker',   0   , 'ranker' ,   0   ,'ranker'],
			 //    				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],

			 //    				/*				楚河									汉界					   */

			 //    				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],
			 //    				['ranker',   0   , 'ranker' ,   0   , 'ranker',   0   , 'ranker' ,   0   ,'ranker'],
			 //    				[    0   ,   0   ,   'gun'  ,   0   ,    0    ,   0   ,   'gun'  ,   0   ,    0   ],
			 //    				[    0   ,   0   ,     0    ,   0   ,    0    ,   0   ,     0    ,   0   ,    0   ],
			 //    				[  'car' ,'horse','elephant','noble','general','noble','elephant','horse',  'car' ]],
			 //    	prev:null,
			 //    	nextStat:[{	//按照change变化，以后的棋盘状态

			 //    	}],
			 //    	allValue:''
	   //  	}],
	   //  	allValue:''
	   //  }];


   // 棋子估值

    var chessValue={
    	'car':[
		        [206, 208, 207, 213, 214, 213, 207, 208, 206],
		        [206, 212, 209, 216, 233, 216, 209, 212, 206],
		        [206, 208, 207, 214, 216, 214, 207, 208, 206],
		        [206, 213, 213, 216, 216, 216, 213, 213, 206],
		        [208, 211, 211, 214, 215, 214, 211, 211, 208],
		         
		        [208, 212, 212, 214, 215, 214, 212, 212, 208],
		        [204, 209, 204, 212, 214, 212, 204, 209, 204],
		        [198, 208, 204, 212, 212, 212, 204, 208, 198],
		        [200, 208, 206, 212, 200, 212, 206, 208, 200],
		        [194, 206, 204, 212, 200, 212, 204, 206, 194]
		        ],
	    'horse':[
		        [90, 90, 90, 96, 90, 96, 90, 90, 90],
		        [90, 96,103, 97, 94, 97,103, 96, 90],
		        [92, 98, 99,103, 99,103, 99, 98, 92],
		        [93,108,100,107,100,107,100,108, 93],
		        [90,100, 99,103,104,103, 99,100, 90],
		         
		        [90, 98,101,102,103,102,101, 98, 90],
		        [92, 94, 98, 95, 98, 95, 98, 94, 92],
		        [93, 92, 94, 95, 92, 95, 94, 92, 93],
		        [85, 90, 92, 93, 78, 93, 92, 90, 85],
		        [88, 85, 90, 88, 90, 88, 90, 85, 88]
		    ],
		'elephant':[
		        [0, 0,20, 0, 0, 0,20, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0,23, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0,20, 0, 0, 0,20, 0, 0],
		         
		        [0, 0,20, 0, 0, 0,20, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [18,0, 0, 0,23, 0, 0, 0,18],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0,20, 0, 0, 0,20, 0, 0]
		    ],
		'noble':[
		        [0, 0, 0,20, 0,20, 0, 0, 0],
		        [0, 0, 0, 0,23, 0, 0, 0, 0],
		        [0, 0, 0,20, 0,20, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		         
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0,20, 0,20, 0, 0, 0],
		        [0, 0, 0, 0,23, 0, 0, 0, 0],
		        [0, 0, 0,20, 0,20, 0, 0, 0]
		    ],
		'general':[
		        [0, 0, 0, 1000, 1000, 1000, 0, 0, 0],
		        [0, 0, 0, 1000, 1000, 1000, 0, 0, 0],
		        [0, 0, 0, 1000, 1000, 1000, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		         
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0],
		        [0, 0, 0, 0, 0, 0, 0, 0, 0]
		    ],
		'gun':[
		        [100, 100,  96, 91,  90, 91,  96, 100, 100],
		        [ 98,  98,  96, 92,  89, 92,  96,  98,  98],
		        [ 97,  97,  96, 91,  92, 91,  96,  97,  97],
		        [ 96,  99,  99, 98, 100, 98,  99,  99,  96],
		        [ 96,  96,  96, 96, 100, 96,  96,  96,  96],
		         
		        [ 95,  96,  99, 96, 100, 96,  99,  96,  95],
		        [ 96,  96,  96, 96,  96, 96,  96,  96,  96],
		        [ 97,  96, 100, 99, 101, 99, 100,  96,  97],
		        [ 96,  97,  98, 98,  98, 98,  98,  97,  96],
		        [ 96,  96,  97, 99,  99, 99,  97,  96,  96]
		    ],
		'ranker':[
                [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
                [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
                [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
                [ 7,  0,  7,  0, 15,  0,  7,  0,  7],
                [ 7,  0, 13,  0, 16,  0, 13,  0,  7],

                [14, 18, 20, 27, 29, 27, 20, 18, 14],
                [19, 23, 27, 29, 30, 29, 27, 23, 19],
                [19, 24, 32, 37, 37, 37, 32, 24, 19],
                [19, 24, 34, 42, 44, 42, 34, 24, 19],
		        [ 9,  9,  9, 11, 13, 11,  9,  9,  9],
		    ]
    },
    // 棋盘状态
    	/*chessState={
    		change:{},
    		chessBoard:[
				[{chess:'car',is:'blue'},
			 	 {chess:'horse',is:'blue'},
			 	 {chess:'elephant',is:'blue'},
			 	 {chess:'noble',is:'blue'},
			 	 {chess:'general',is:'blue'},
			 	 {chess:'noble',is:'blue'},
			 	 {chess:'elephant',is:'blue'},
			 	 {chess:'horse',is:'blue'},
			 	 {chess:'car',is:'blue'}
			 	],
				[0,0,0,0,0,0,0,0,0],
				[0,{chess:'gun',is:'blue'},0,0,0,0,0,{chess:'gun',is:'blue'},0],
				[{chess:'ranker',is:'blue'},0,
				{chess:'ranker',is:'blue'},0, 
				{chess:'ranker',is:'blue'},0, 
				{chess:'ranker',is:'blue'},0,
				{chess:'ranker',is:'blue'}],
				[0,0,0,0,0,0,0,0,0],

				/*				楚河									汉界					   */

				/*[0,0,0,0,0,0,0,0,0],
				[{chess:'ranker',is:'red'},0, 
				{chess:'ranker',is:'red'},0, 
				{chess:'ranker',is:'red'},0, 
				{chess:'ranker',is:'red'},0,
				{chess:'ranker',is:'red'}],
				[0,{chess:'gun',is:'red'},0,0,0,0,0,{chess:'gun',is:'red'},0],
				[0,0,0,0,0,0,0,0,0],
				[{chess:'car',is:'red'} ,
				{chess:'horse',is:'red'},
				{chess:'elephant',is:'red'},
				{chess:'noble',is:'red'},
				{chess:'general',is:'red'},
				{chess:'noble',is:'red'},
				{chess:'elephant',is:'red'},
				{chess:'horse',is:'red'},
				{chess:'car',is:'red'}]
			],
    		prev:null,
    		nextStat:[],
    		allValue:{}
    	},*/

    	// 搜索深度.
    	DEEP=2,
    	serchDeep=0,
    	path=[],
        otherPath=[];

    return function(ops){
        var that = {},
        	chessBoard=[],	//当前棋盘
        	guessBoard=[],	//推测棋盘
            aiIs = '';	//ai是蓝方或红方

        function init(){
        	var conf;

        	conf = STK.core.obj.parseParam({
        		'aiIs' : 'blue',
        		'deep' : 2
        	} , ops);

        	aiIs = conf['aiIs'];
        	DEEP = conf['deep'];
        }

        //获取棋盘的估值，blue && red
        function getValue(cs){
        	// cs 棋盘
        	var blueValue=0,redValue=0;
        	for(var i=0;i<10;i++){
        		for(var j=0;j<9;j++){
        			if(cs[i][j].is){
        				if(cs[i][j].is=='blue'){
        					blueValue+=chessValue[cs[i][j].chess][i][j];
        				}else if(cs[i][j].is=='red'){
        					redValue+=chessValue[cs[i][j].chess][9-i][8-j];
        				}
        			}
        		}
        	}

        	return {blue:blueValue,red:redValue};
        }

        function go(side,obj,_serchDeep){

        	// side 蓝方 blue 或者 红方 red
        	// obj 当前棋盘状态对象

        	var moveArr=[],
        		otherSide=side=='blue'?'red':'blue';
        	for(var i=0;i<10;i++){
        		for(var j=0;j<9;j++){
        			if(obj.chessBoard[i][j]){
        				if(obj.chessBoard[i][j].is==side){
        					moveArr=testMove(i,j,obj.chessBoard);
        					for(var k=0,len=moveArr.length;k<len;k++){
        						moveTo(obj,moveArr[k],i,j);
        					}
        				}
        			}
        		}
        	}

            if(_serchDeep<=DEEP){
                if(side==aiIs){
            		for(var i=0,len=obj.nextStat.length;i<len;i++){
            			go(otherSide,obj.nextStat[i],_serchDeep+1);
            		}
                }else{
                    getMostValue(obj,0,side);
                    obj.nextStat[0]=obj.nextStat[otherPath];
                    obj.nextStat.length=1;
                    go(otherSide,obj.nextStat[0],_serchDeep+1);
                }
            }else{
                return false;
            }

        }

        function moveTo(obj,toPos,top,left){
        	var _stat={
        		change:{},
        		chessBoard:[],
        		nextStat:[],
        		allValue:0,
        		prev:null
        	};
        	_stat.change.node={
        		chess:obj.chessBoard[top][left].chess,
        		is:obj.chessBoard[top][left].is
        	};
        	_stat.change.from={
        		top:top,
        		left:left
        	}

        	_stat.change.to={
        		top:toPos[0],
        		left:toPos[1]
        	},

        	_stat.chessBoard=STK.core.json.clone(obj.chessBoard);
        	_stat.chessBoard[toPos[0]][toPos[1]]={};
        	_stat.chessBoard[toPos[0]][toPos[1]].chess=obj.chessBoard[top][left].chess;
        	_stat.chessBoard[toPos[0]][toPos[1]].is=obj.chessBoard[top][left].is;
        	_stat.chessBoard[top][left]=0;

        	_stat.allValue=getValue(_stat.chessBoard);

        	obj.nextStat.push(_stat);
        }

        function testMove(top,left,chessBoard){

        	// top，left:棋子坐标
        	// chessBoard:棋盘


        	var near=0,
        		canMoveArr=[],
        		side=chessBoard[top][left].is,
        		moveType;

        	switch(chessBoard[top][left].chess){
        		case 'car':
        		// 测试Y轴上，在当前坐标上面的点是否可移动
        			for(var i=top-1;i>=0;i--){
        				if(!chessBoard[i][left]){
        					canMoveArr.push([i,left]);
        				}else if(chessBoard[i][left].is!=side){
                            canMoveArr.push([i,left]);
                            break;
                        }else{
        					break;
        				}
        			}
        		// 测试Y轴下，在当前坐标下面的点是否可移动
        			for(var i=top+1;i<10;i++){
        				if(!chessBoard[i][left]){
        					canMoveArr.push([i,left]);
        				}else if(chessBoard[i][left].is!=side){
                            canMoveArr.push([i,left]);
                            break;
                        }else{
        					break;
        				}
        			}

        		// 测试X轴左，在当前坐标左边的点是否可移动
        			near=0;
        			for(var i=left-1;i>=0;i++){
        				if(!chessBoard[top][i]){
        					canMoveArr.push([top,i]);
        				}else if(chessBoard[top][i].is!=side){
                            canMoveArr.push([top,i]);
                            break;
                        }else{
        					break;
        				}
        			}

        		// 测试X轴右，在当前坐标右边的点是否可移动
        			near=0;
        			for(var i=left+1;i<9;i++){
        				if(!chessBoard[top][i]){
        					canMoveArr.push([top,i]);
        				}else if(chessBoard[top][i].is!=side){
                            canMoveArr.push([top,i]);
                            break;
                        }else{
        					break;
        				}
        			};

	    			return canMoveArr;
        		case 'horse':
        			moveType=[[top+1,left+2],[top+1,left-2],[top-1,left-2],[top-1,left+2],[top+2,left-1],[top-2,left-1],[top+2,left+1],[top-2,left+1]];
        			for(var i=0;i<8;i++){
    					if(moveType[i][0]>=0&&moveType[i][0]<=9&&moveType[i][1]>=0&&moveType[i][1]<=8){
	        				if(!chessBoard[moveType[i][0]][moveType[i][1]]||chessBoard[moveType[i][0]][moveType[i][1]].is!=side){
	    						if(Math.abs(moveType[i][0]-top)==1){
	    							if(moveType[i][1]-left==2){
	    								if(left+1>8) continue;
	    								if(!chessBoard[top][left+1]){
	    									canMoveArr.push(moveType[i]);
	    								}
	    							}else{
	    								if(left-1<0) continue;
	    								if(!chessBoard[top][left-1]){
	    									canMoveArr.push(moveType[i]);
	    								}
	    							}
	    						}else{
	    							if(moveType[i][0]-top==2){
	    								if(top+1>9) continue;
	    								if(!chessBoard[top+1][left]){
	    									canMoveArr.push(moveType[i])
	    								}
	    							}else{
	    								if(top-1<0) continue;
	    								if(!chessBoard[top-1][left]){
	    									canMoveArr.push(moveType[i]);
	    								}
	    							}
	    						}
	    					}
        				}
        			};

        			return canMoveArr;
        		case 'elephant':
        			moveType=[[top+2,left+2],[top+2,left-2],[top-2,left+2],[top-2,left-2]];
        			for(var i=0;i<4;i++){
        				if((top<=4&&moveType[i][0]<=4)||(top>=5&&moveType[i][0]>=5)){
	        				if(moveType[i][0]>=0&&moveType[i][0]<=9&&moveType[i][1]>=0&&moveType[i][1]<=8){
	        					if(!chessBoard[moveType[i]]||chessBoard[moveType[i]].is!=side){
	        						if(!chessBoard[(moveType[i][0]+top)/2][(moveType[i][1]+left)/2]){
	        							canMoveArr.push(moveType[i]);
	        						}
	        					}
	        				}
	        			}
        			}

        			return canMoveArr;
        		case 'noble':
        			moveType=[[top+1,left+1],[top-1,left-1],[top+1,left-1],[top-1,left+1]];
        			for(var i=0;i<4;i++){
        				if((top<=2&&moveType[i][0]<=2)||(top>=7&&moveType[i][0]<=2)){
	        				if(moveType[i][0]>=0&&moveType[i][0]<=9&&moveType[i][1]>=3&&moveType[i][1]<=5){
	        					if(!chessBoard[moveType[i][0]][moveType[i][1]]||chessBoard[moveType[i][0]][moveType[i][1]].is!=side){
	        						canMoveArr.push(moveType[i]);
	        					}
	        				}
	        			}
        			}

        			return canMoveArr;
        		case 'general':
        			moveType=[[top+1,left],[top-1,left],[top,left-1],[top,left+1]];
        			for(var i=0;i<4;i++){
        				if((top<=2&&moveType[i][0]<=2)||(top>=7&&moveType[i][0]>=7)){
	        				if(moveType[i][0]>=0&&moveType[i][0]<=9&&moveType[i][1]>=3&&moveType[i][1]<=5){
	        					if(!chessBoard[moveType[i][0]][moveType[i][1]]||chessBoard[moveType[i][0]][moveType[i][1]].is!=side){
	        						canMoveArr.push(moveType[i]);
	        					}
	        				}
	        			}
        			}

        			return canMoveArr;
        		case 'gun':
        			//Y轴上方测试
        			for(var i=top-1;i>=0;i--){
        				if(!chessBoard[i][left]&&near==0){
        					canMoveArr.push([i,left]);
    					}else if(chessBoard[i][left]&&chessBoard[i][left].is!=side&&near==1){
    						canMoveArr.push([i,left]);
                            near++;
    					}else{
    						if(chessBoard[i][left]){
	    						near++;
	    					}
    					}
        			}

        			near=0;

        			//Y轴下方测试
        			for(var i=top+1;i<=9;i++){
        				if(!chessBoard[i][left]&&near==0){
        					canMoveArr.push([i,left]);
    					}else if(chessBoard[i][left]&&chessBoard[i][left].is!=side&&near==1){
    						canMoveArr.push([i,left]);
                            near++;
    					}else{
    						if(chessBoard[i][left]){
	    						near++;
	    					}
    					}
        			}

        			near=0;

        			//X轴左边测试
        			for(var i=left-1;i>=0;i--){
        				if(!chessBoard[top][i]&&near==0){
        					canMoveArr.push([top,i]);
    					}else if(chessBoard[top][i]&&chessBoard[top][i].is!=side&&near==1){
    						canMoveArr.push([top,i]);
                            near++;
    					}else{
    						if(chessBoard[top][i]){
	    						near++;
	    					}
    					}
        			}

        			near=0;

        			//X轴右边测试
        			for(var i=left+1;i<=8;i++){
        				if(!chessBoard[top][i]&&near==0){
        					canMoveArr.push([top,i]);
    					}else if(chessBoard[top][i]&&chessBoard[top][i].is!=side&&near==1){
    						canMoveArr.push([top,i]);
                            near++;
    					}else{
    						if(chessBoard[top][i]){
	    						near++;
	    					}
    					}
        			}

        			return canMoveArr;

        		case 'ranker':
        			moveType=[[top+1,left],[top-1,left],[top,left+1],[top,left-1]];
        			for(var i=0;i<4;i++){
        				//在棋盘坐标以内
        				if(moveType[i][0]>=0&&moveType[i][0]<=9&&moveType[i][1]>=0&&moveType[i][1]<=9){
        					//移动到的地方不能有己方棋子
    						if(!chessBoard[moveType[i][0]][moveType[i][1]]||chessBoard[moveType[i][0]][moveType[i][1]].is!=side){
	        					//如果是蓝方，同时不能后退
	        					if(chessBoard[top][left].is=='blue'&&moveType[i][0]>=top){
	        						//则，Y轴下于5的时候，不能横向移动
	        						if(top<=4){
	        							if(moveType[i][0]!=top){
	        								canMoveArr.push(moveType[i]);
	        							}
	        						}else{
        								canMoveArr.push(moveType[i]);
	        						}
	        					// 否则是红方
	        					}else if(chessBoard[top][left].is=='red'){
	        						//不能后退
	        						if(moveType[i][0]<=top){
	        							//Y轴大于等于5，不能横向移动
	        							if(top>=5){
	        								if(moveType[i][0]!=top){
	        									canMoveArr.push(moveType[i]);
	        								}
	        							}else{
	        								canMoveArr.push(moveType[i]);
	        							}
	        						}
	        					}
        					}
        				}
        			}

        			return canMoveArr;
        	}
        }

        function getMostValue(obj,_index,side){
        	var len=obj.nextStat.length,
        		objName,
        		valueArr=[],
        		_max={
        			value:0,
        			i:0
        		},
                _side=side||aiIs;
        	if(len!=0){
        		for(var i=0;i<len;i++){
        			valueArr.push(getMostValue(obj.nextStat[i],_index+1));
        		}
    			for(var j=0,_len=valueArr.length;j<_len;j++){
    				if(valueArr[j]>_max.value){
    					_max.value=valueArr[j];
    					_max.i=j;
    				}
    			}
                if(_side==aiIs){
        			path[_index]=_max.i;
                }else{
                    otherPath=_max.i;
                }
    			return _max.value;
        	}else{
        		allValue=obj.allValue[_side]*obj.allValue[_side]/obj.allValue[_side=='blue'?'red':'blue'];
        		return allValue;
        	}
        }

        init();

        function getNext(stat){
	        go('blue',stat,1);
	        getMostValue(stat,0);

	        // return stat.nextStat[path[path.length-1]].change;
	        return path;
        }

        var bindListener=function(){
        	STK.chess.link.register("getNext", function(opts){
        		opts.chessStat.change={};
        		opts.chessStat.nextStat=[];
        		opts.chessStat.allValue={};
        		opts.chessStat.prev=null;
        		var next=getNext(opts.chessStat);
        		STK.chess.link.fire("backNext", opts.chessStat.nextStat[next[0]].change);
        	});
        }

        bindListener();

        return that;
    }
});

/*
1,9876

*/