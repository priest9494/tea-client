<template>
	<div class="tea-main">
		<button @click="removeUnsub">Сбросить отписки</button>

		<br>
		<input type="radio" id="one" value="collab" v-model="selectedRecommendType" @click="changeRecommend(val)">
		<label for="one">Коллаборативная</label>
		<br>
		<input type="radio" id="two" value="content" v-model="selectedRecommendType" @click="changeRecommend(val)">
		<label for="two">Контент ориентированная</label>
		<br>
		<input type="radio" id="two" value="params" v-model="selectedRecommendType" @click="changeRecommend(val)">
		<label for="two">Параметрический запрос</label>

		<div class="tea-header">
			<div class="recommended-mode-select" v-if="false">
				<input type="radio" id="one" value="collab" v-model="pickedMode">
				<label for="one">Коллаборативная</label>
				<input type="radio" id="two" value="content" v-model="pickedMode">
				<label for="two">Контенто-ориентированная</label>
				<input type="radio" id="three" value="paramReqest" v-model="pickedMode">
				<label for="two">Параметрический запрос</label>
			</div>
		</div>
		<div class="search-params">
			Цена
			<br>
			<vue-slider v-model="priceRange" :min="100" :max="1900" @change="getRecommends"/>
			Вес упаковки
			<br>
			<vue-slider v-model="weightRange" :min="10" :max="130" @change="getRecommends"/>
			Размер листа
			<br>
			<vue-slider v-model="leafRange" :min="1" :max="3" @change="getRecommends"/>
			<br>
			Неточный вывод
			<input type="checkbox" v-model="inaccurate">
		</div>
		<div class="tea-body">
			<div class="categories-wrapper">
				Категории:
				<ul
					class="categories"
					v-for="teaColor in teaTree.data.children"
					:key="teaColor.name"
				>
					<li class="tea-tree-item" @click="selectGroup(teaColor.name)">{{ teaColor.name }}</li>
				</ul>
			</div>
			
			<div class="tea-list">
				<div
					class="tea-view"
					v-for="item in teaTree.data.children"
					:key="item.name"
				>
					<div class="tea-item" v-if="item.name == category">
						<div class="tea" v-for="tea in item.children" :key="tea" @click="choose(tea.props.name)">
							Название: {{ tea.props.name }}
							<br>
							Цена: {{tea.props.price}}
							<br>
							Вес упаковки: {{tea.props.weight}}
							<br>
							Размер листа: {{tea.props.leafSize}}
							<br>
							Ароматизация: {{tea.props.arom}}
							<br>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="basket">
				Корзина: {{ displayBasket }}
			</div>

		<div class="recommended-wrapper">
			<div class="recommended-header">
				Вам также может понравиться
			</div>
			<div class="recommended-body">
				<div class="tea-rec" v-for="rec in recommendedList" :key="rec" >
					<div class="rec" @click="choose(rec.name)">
						Название: {{ rec.name }}
						<br>
						Цена: {{rec.price}}
						<br>
						Вес упаковки: {{rec.weight}}
						<br>
						Размер листа: {{rec.leafSize}}
						<br>
						Ароматизация: {{rec.arom}}
						<br>
					</div>
					<button v-on:click="unsub(rec)">Не интересует</button>
				</div>
			</div>
		</div>
		<div class="confirm-wrapper">
			<button class="confirm-but" @click="purchase">Купить</button>
		</div>
	</div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'

export default {
	components: {
		VueSlider 
	},
	data() {
		return {
			pickedMode: 'collab',
			teaTree: { data: { children: null }},
			inaccurate: true,
			category: 'Пуэр',
			basket: [],
			recommendedList: [],
			selectedRecommendType: 'collab',
			priceRange: [300, 1500],
			weightRange: [20, 80],
			leafRange: [1, 3]
		}
	},
	created() {
		this.getTree();
	},
	computed: {
		displayBasket: function() {
			let choosements = ""
			this.basket.forEach(item => {
				choosements += item + ', ';
			})
			return choosements;
		}
	},
	methods: {
		changeRecommend(val) {
			this.selectedRecommendType = val;
			this.getRecommends();
		},
		purchase() {
			this.basket = [];
		},
		async removeUnsub() {
			this.$cookies.set('avoidList', JSON.stringify([]));
			this.getRecommends();
		},
		async unsub(rec) {
			let cookies = this.$cookies.get('avoidList');
			let arr = [];

			if (cookies != null) {
				arr = JSON.parse(cookies);
			}

			arr.push(rec.name);
			arr = [...(new Set(arr))];
			this.$cookies.set('avoidList', JSON.stringify(arr));

			this.getRecommends();
		},
		async choose(name) {
			this.basket.push(name);
			this.getRecommends();
		},
		selectGroup(name) {
			this.category = name;
			this.getRecommends();
		},
		async getTree() {
			this.teaTree = await this.$axios.get('http://localhost:3030/teaTree');
		},
		async getRecommends() {
			if(this.selectedRecommendType === 'collab') {
				this.recommendedList = (await this.$axios.post('http://localhost:3030/collab', {'basket': this.basket, 'avoidList':JSON.parse(this.$cookies.get('avoidList'))})).data;
			} else if (this.selectedRecommendType === 'content') {
				this.recommendedList = (await this.$axios.post('http://localhost:3030/content', {'basket': this.basket, 'avoidList':JSON.parse(this.$cookies.get('avoidList'))})).data;
			} else if (this.selectedRecommendType === 'params'){
				this.recommendedList = (await this.$axios.post('http://localhost:3030/params', {
					'color': this.category,
					'priceRange': this.priceRange, 
					'weightRange': this.weightRange, 
					'leafRange': this.leafRange, 
					'inaccurate': this.inaccurate})).data;
			}
		}
	}
}
</script>

<style>
.tea-header {
	display: flex;
	align-items: center;
	flex-direction: column;
	font-size: 50px;
	padding: 30px;
}

.recommended-mode-select {
	font-size: 20px;
	line-height: 30px;
}

.tea-body, .recommended-body {
	display: flex;
}

.tea-list{
	width: 80vw;
	margin-left: 10%;
}


.search-params {
	width: 60%;
	margin-left: 20%;
}

.categories-wrapper {
	margin-left: 20px;
	display: flex;
	flex-direction: column;
	font-size: 20px;
}

.tea-tree-item {
	cursor: pointer;
}

.tea-item {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;

}

.tea, .tea-rec{
	margin: 20px;
	padding: 30px;
	border: 2px solid black;
	cursor: pointer;

}

.tea:hover, .tea-rec:hover {
	background: rgb(240, 253, 228);
}

.recommended-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 50px;
}

.recommended-header {
	font-size: 30px;
}

.confirm-wrapper {
	margin-top: 30px;
	display: flex;
	justify-content: center;
}

.confirm-but {
	padding: 10px 20px;
	font-size: 30px;
}

</style>
