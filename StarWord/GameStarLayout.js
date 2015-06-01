星星消除层之——寻找相同类型星星
一、总体实现思路
1、setVariable()属性初始化。
2、zinit()层初始化。
3、layoutStar()将星星按10*10的矩阵排列出来。
4、addTouchEventListener()给每个星星注册监听器。选中星星的时候有个表现逻辑，当第一次选中时呈现选中状态，并将其保存在firstTouchStar中。当第二次选择时
有几种情况：
	1、选中同色星星长度大于1.
		1、选中本身，将其还原为未选中状态，并将firstTouchStar赋值null。
		2、选中与firstTouchStar类型相同并且相连的星星，执行消除动作[resetStarRow()]，并将firstTouchStar赋值null。
		3、选中的是与firstTouchStar类型不同的星星，将其赋值给firstTouchStar，并将之前选中的星星还原为未选中状态。
	2、选中的同色星星长度等于1.
		1、选中本身，将其还原为未选中状态，并将firstTouchStar赋值null。
		2、选中其它任何星星，将其赋值给firstTouchStar，并将之前选中的星星还原为未选中状态。
5、findSameColorStar()寻找相连在一起同色的星星。
6、resetStarRow()消除星星。
7、checkMove()移动星星[向下和向左移动]。
	1、水平方向checkTop()。
	2、竖直方向checkEmptyColums()[检测是否存在空列]。

二、寻找相连在一起同色的星星：
findSameColorStar()寻找相连在一起同色的星星。
如图一所示，假如现在点击的是方块A，我们就将以方块A为起点开始寻找它四周的与其颜色和类型相同的方块。这里假设方块A在网格中的坐
标为：行数col = 5，列数row = 5，类型type = 1，及在网格中的第五行第五列的位置。然后可以知道与其相邻的B、C、D、E在网格中的
位置依次是(6, 5),(5, 6),(4, 5),(5, 4)；从颜色上可以判断其中B、E的类型和A是相同的，而C、D是另一种类型，这里假设为2；要找到
与A颜色类型相同的方法，就必须以A点为起点，从它四周依次查找与之颜色类型相同的方块，当发现颜色类型与A相同的方块时将其保存起来
然后再以改点为起点，查找其四周是否有颜色类型相同的方块，如果有则将其保存起来...这样不断的查找下去，直到找不到颜色类型相同的
方块，查找才算结束，如果颜色类型不同直接图略。比如：以A为起点发现其周围B、E颜色类型与A相同，则将B、E保存起来，而C、D颜色类型
与A不相同，则图略。然后以B、E为起点查找其四周是否有颜色类型相同的方块...这样不断的重复下去，直到查找结束。这里有一点要特别
值得注意的是，当以E、B为起点的时候会再次查找A，很显然A与E、B的颜色类型是相同的，如果再把A保存起来，又会以A为起点查找到E、B
这样反反复复，重复的没完没了，这样导致的后果就是死循环，游戏会立刻崩掉。所以为了避免这这种情况发生，在A查找结束后将其保存起来
的同时将其类型临时的该为不可用状态（-1），这样在以E、B为起点的时候就不会再一次查找A了，同样E、B查找结束后立即将其类型设为
不可用状态（-1），这样就不会造成死循环了。如图二所示，最后得到颜色类型相同的方块列表里有ABPEFG.
这里我们写一个单独用来查找类型相同方块的方法，为了与游戏源码命名一致，这里将方
法取名为getSameColorStar(col, row, type)；其中的参数分别表示方块的行数，列数和类型，方法内容如下代码所示：其还回的starList
就是当前找到的颜色类型相同的方块列表。
findSameColorStar:function(target)
{
	//相连同色星星列表
	//将列表清空
	this.starList.splice(0);
	//获取相同类型的星星[参数依次为星星在网格中的水平坐标、垂直坐标，类型]
	this.starList = this.getSameColorStar(target.col, target.row, target.type);
	//将满足条件的相连同色星星设为选中状态,玩家能对消除星星数量一幕了然
	this.showCurrentSameStarSelectedState(this.starList);
},
//获得相连同色星星列表[查找类型相同方块的方法]
getSameColorStar:function(col, row, type)
{
	//临时数组[存放颜色类型相同的星星]
	var starList = [];
	//必须控制星星在矩阵范围内[不存在则直接换回空数组]
	if( this.jugementStarPostion(col, row) == -1 )
	{
		return starList;	
	}
	//从网格中查找当前行列的星星类型是否与当前点击星星类型相同
	if( this.starObjArr[col][row].type == type )
	{
		//相同则将其存放在临时数组中
		starList.push(this.starObjArr[col][row]);
		//并将其状态设为不可用（-1）
		this.starObjArr[col][row].type = -1;
		//递归调用,寻找当前星星四周的同色星星
		starList = starList.concat(this.getSameColorStar(col+1, row, type));//右边
		starList = starList.concat(this.getSameColorStar(col - 1, row, type));//左边
		starList = starList.concat(this.getSameColorStar(col, row + 1, type));//上方
		starList = starList.concat(this.getSameColorStar(col, row - 1, type));//下方
	}
	return starList;
},
//判断星星是否在矩阵范围内,
jugementStarPostion:function(col, row)
{
	//超出水平范围
	if(col < 0 ||col >9)	
	{
		return -1;
	}
	//超出垂直范围
	if(row < 0 || row > 9) 
	{
		return -1;
	}
	//该星星不存在
	if( this.starObjArr[col][row] == null || this.starObjArr[col][row] == undefined )	
	{
		return -1;
	}
	//存在则返回其类型
	return this.starObjArr[col][row].type;
},
//将满足条件的相连同色星星设为选中状态
showCurrentSameStarSelectedState:function(starList)
{
	for(var i = 0; i < starList.length; i++)
	{
		//将星星设为选中状态
		starList[i].isSelected = true;
		//更新纹理为选中状态
		starList[i].updateTexture();
		starList[i].count++;
	}
}
6、resetStarRow()消除星星。
//当消灭星星后,如果上方还有星星存在,则要重新设置他们的row值,用于向下移动星星
resetStarRow:function()
{
	for(var i = 0; i < this.starList.length; i++)
	{
		var xx = this.starList[i].x, yy = this.starList[i].y, type = this.starList[i].type;
		//播放消除时爆炸音效
		var sys = this.addExplosion(xx, yy, type, 20);
		this.addChild(sys, 100);
		//将其类型设为-1[无效类型]
		this.starList[i].type = -1;
		//将其移除[消除]
		this.starList[i].removeFromParent();
		//如果被消除的星星上方还有星星，则将其垂直方向坐标重置
		for(var j = this.starList[i].row+1; j< 10; j++)
		{
			//检测是否存在
			if(!this.starObjArr[this.starList[i].col][j]){continue;} 
			this.starObjArr[this.starList[i].col][j].row--;
			this.starObjArr[this.starList[i].col][j-1] = this.starObjArr[this.starList[i].col][j];
			this.starObjArr[this.starList[i].col][j] = null;
		}
	}
},
7、checkMove()移动星星
	1、水平方向checkTop()。
	2、竖直方向checkEmptyColums()[检测是否存在空列]。