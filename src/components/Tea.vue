<template>
    <div class="tea-main">
        <div class="tea-header">
            <div class="categories">
                <div class="categories-header">
                    Категории
                </div>
				<div class="categories-body">
					<div
						class="category"
						v-for="teaColor in teaTree.data.children"
						:key="teaColor.name"
					>
						<span
							@click="selectGroup(teaColor.name)"
							:class="{ 'category-selected': teaColor.name === category }"
							>{{ teaColor.name }}</span>
					</div>
				</div>
            </div>

            <div class="filters">
                <div class="filters-header">
                    Фильтры
                    <span class="show-filters" @click="showFilters = !showFilters" v-show="showFilters">[Свернуть]</span>
                    <span class="show-filters" @click="showFilters = !showFilters" v-show="!showFilters">[Развернуть]</span>
                </div>

                <div class="filters-body" v-show="showFilters">
                    Цена
                    <vue-slider v-model="priceRange" :min="100" :max="1900" @change="getTeaList"/>
                    Вес упаковки
                    <br>
                    <vue-slider v-model="weightRange" :min="10" :max="130" @change="getTeaList"/>
                    Размер листа
                    <br>
                    <vue-slider v-model="leafRange" :min="1" :max="3" @change="getTeaList"/>
                    <br>
                    Неточный вывод
                    <input type="checkbox" v-model="inaccurate">
                </div>
            </div>
        </div>

		<div class="basket">
			Корзина: {{ displayBasket }}
		</div>

		<div class="tea-body">
			<div class="tea-item" v-for="tea in teaList" :key="tea" @click="choose(tea.name)">
				Название: {{ tea.name }}
				<br>
				Цена: {{tea.price}}
				<br>
				Вес упаковки: {{tea.weight}}
				<br>
				Размер листа: {{tea.leafSize}}
				<br>
				Ароматизация: {{tea.arom}}
			</div>
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
            showFilters: true,
			teaTree: { data: { children: null }},
			inaccurate: true,
			category: 'Пуэр',
			basket: [],
			recommendedList: [],
			selectedRecommendType: 'collab',
			priceRange: [100, 1900],
			weightRange: [10, 130],
			leafRange: [1, 3],
			teaList: []
		}
    },
    created() {
		this.getTree();
		this.getTeaList();
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
			this.getTeaList();
		},
		async getTree() {
			this.teaTree = await this.$axios.get('http://localhost:3030/teaTree');
		},
		async getRecommends() {
			if(this.selectedRecommendType === 'collab') {
				this.recommendedList = (await this.$axios.post('http://localhost:3030/collab', {'basket': this.basket, 'avoidList':JSON.parse(this.$cookies.get('avoidList'))})).data;
			} else if (this.selectedRecommendType === 'content') {
				this.recommendedList = (await this.$axios.post('http://localhost:3030/content', {'basket': this.basket, 'avoidList':JSON.parse(this.$cookies.get('avoidList'))})).data;
			}
		},
		async getTeaList() {
			this.teaList = (await this.$axios.post('http://localhost:3030/params', {
				'color': this.category,
				'priceRange': this.priceRange, 
				'weightRange': this.weightRange, 
				'leafRange': this.leafRange, 
				'inaccurate': this.inaccurate
			})).data;
		}
	}
}
</script>

<style>
.tea-header {
    display: flex;
	flex-direction: column;
	align-items: center;
}

.categories {
    height: 100%;
    margin-left: 10px;
}

.categories-header {
    font-size: 30px;
    font-weight: 400;
	text-align: center;
}

.categories-body {
	display: flex;
	justify-content: space-between;
	text-decoration: underline;
}

.category {
    padding: 20px 50px 0 50px;
    cursor: pointer;
    font-size: 20px;
}

.category-selected{
	background: rgb(219, 252, 215);
}

.filters {
    width: 100%;
}

.filters-header {
    margin-top: 15px;
    text-align: center;
    font-size: 15px;
    font-weight: 400;
}

.filters-body {
    width: 60%;
    margin: 30px 0 0 20%;
}

.show-filters {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
}

.tea-body {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	width: 80vw;
	margin: 0 10%;
}

.tea-item {
	padding: 25px;
	margin: 15px;
	border: 1px solid black;
	cursor: pointer;
}

.tea-item:hover {
	background: rgb(226, 255, 234);
}

</style>