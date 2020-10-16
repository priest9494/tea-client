<template>
	<div class="tea-main">
		<button @click="removeUnsub">Сбросить отписки</button>
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
			<button class="confirm-but">Купить</button>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			pickedMode: 'collab',
			teaTree: {data: { children: null}},
			category: 'Пуэр',
			basket: [],
			recommendedList: [],
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
		async removeUnsub() {
			this.$cookies.set('unsubGroup', JSON.stringify([]));
			this.recommendedList = (await this.$axios.post('http://localhost:3030/collab', {'basket': this.basket, 'groups':JSON.parse(this.$cookies.get('unsubGroup'))})).data;
		},
		async unsub(rec) {
			let cookies = this.$cookies.get('unsubGroup');
			let arr = [];

			if (cookies != null) {
				arr = JSON.parse(cookies);
			}

			arr.push(rec.group);
			arr = [...(new Set(arr))];
			this.$cookies.set('unsubGroup', JSON.stringify(arr));

			this.recommendedList = (await this.$axios.post('http://localhost:3030/collab', {'basket': this.basket, 'groups':JSON.parse(this.$cookies.get('unsubGroup'))})).data;
		},
		async choose(name) {
			this.basket.push(name);
			this.recommendedList = (await this.$axios.post('http://localhost:3030/collab', {'basket': this.basket, 'groups':JSON.parse(this.$cookies.get('unsubGroup'))})).data;
		},
		selectGroup(name) {
			this.category = name
		},
		async getTree() {
			this.teaTree = await this.$axios.get('http://localhost:3030/teaTree');
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
