<template>
	<div
		class="mt-1 rounded"
		:class="{ highlight: selectedFeature }"
	>
		<b-list-group-item
			ref="feature"
			button
			:class="[{ selected: selectedFeature, disabled: onEditMode }]"
			class="px-2 rounded"
			:style="{ borderLeftColor: form.color }"
			@click="featureClicked()"
		>
			<span class="text-break">
				<i
					class="fas fa-fw mr-1"
					:class="icons[feature.getGeometry().getType()]"
				/>
				{{ form.name }}
			</span>
			<span v-if="selectedFeature">
				<i class="fas fa-fw fa-times" />
			</span>
			<span
				v-else-if="editable"
				class="ml-auto text-danger"
				role="button"
				@click.stop="deleteFeature"
			>
				<i class="fas fa-fw fa-trash" />
			</span>
		</b-list-group-item>
		<b-collapse
			:id="`collapse-${feature.getId()}`"
			:visible="selectedFeature"
			accordion="my-accordion"
			@shown="expandFinished()"
		>
			<b-card
				v-if="selectedFeature && (editable || (form.category || form.description || visitorCanRate))"
				body-class="pb-0"
				class="collapse-content"
			>
				<div v-if="editable">
					<b-row
						v-if="!visitor"
						align-h="between"
						align-v="center"
					>
						<b-col>
							<b-form-group label="Szín">
								<b-form-input
									id="type-color"
									v-model="form.color"
									size="sm"
									type="color"
									list="presetColors"
								/>
								<datalist id="presetColors">
									<option>#F44336</option>
									<option>#E91E63</option>
									<option>#9C27B0</option>
									<option>#673AB7</option>
									<option>#3F51B5</option>
									<option>#2196F3</option>
									<option>#03A9F4</option>
									<option>#00BCD4</option>
									<option>#009688</option>
									<option>#4CAF50</option>
									<option>#8BC34A</option>
									<option>#CDDC39</option>
									<option>#FFEB3B</option>
									<option>#ffc107</option>
									<option>#FF9800</option>
									<option>#FF5722</option>
									<option>#795548</option>
									<option>#9E9E9E</option>
									<option>#000000</option>
									<option>#607D8B</option>
								</datalist>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group label="Méret">
								<b-form-input
									v-model="form.width"
									size="sm"
									type="number"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-form-group
						v-if="!visitor && feature.getGeometry().getType() !== 'Point'"
						label="Vonal"
					>
						<b-form-select
							v-model="form.dash"
							size="sm"
							:options="dashOptions"
						/>
					</b-form-group>
					<b-form-group
						v-if="!visitor"
						label="Név"
					>
						<b-form-input
							id="type-text"
							v-model="form.name"
							size="sm"
							type="text"
						/>
					</b-form-group>
					<b-form-group
						v-if="!visitor"
						label="Kategória"
					>
						<vue-typeahead-bootstrap
							v-model="form.category"
							placeholder="Kategória"
							size="sm"
							:data="categories"
							:min-matching-chars="0"
							show-all-results
							show-on-focus
						/>
					</b-form-group>
					<b-form-group
						v-if="visitor"
						:label="descriptionLabel || 'Miért rajzoltad ezt fel?'"
					>
						<b-textarea
							ref="description"
							v-model="form.description"
						/>
					</b-form-group>
					<b-form-group
						v-else
						class="rich"
						label="Leírás"
					>
						<client-only>
							<tiptap v-model="form.description" />
						</client-only>
					</b-form-group>
				</div>
				<div v-else>
					<b-badge
						v-if="form.category"
						class="border border-secondary mb-2"
						variant="light"
						v-text="form.category"
					/>
					<div
						class="rich"
						v-html="form.description"
					/>
				</div>
				<b-form-group v-if="(visitor && !editable && visitorCanRate) || (!visitor && rating)">
					<div class="border d-flex font-weight-bold justify-content-center p-1">
						<star-rating
							v-model="rating"
							:active-color="visitor ? '#ffc107' : '#17a2b8'"
							:animate="visitor"
							:border-color="visitor ? '#ffc107' : '#17a2b8'"
							:border-width="2"
							clearable
							:fixed-points="1"
							inactive-color="#fff"
							:max-rating="stars"
							:read-only="!visitor"
							:show-rating="!visitor"
							:star-size="16"
						/>
					</div>
				</b-form-group>

				<b-form-group v-if="editable">
					<span
						class="text-danger"
						role="button"
						@click.stop="deleteFeature"
					>
						<i class="fas fa-fw fa-trash mr-1" />
						Elem törlése
					</span>
				</b-form-group>
			</b-card>
		</b-collapse>
	</div>
</template>

<script>
import Feature from 'ol/Feature';
import { mapGetters } from 'vuex';
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';

export default {
	components: {
		VueTypeaheadBootstrap,
	},
	props: {
		categories: {
			type: Array,
			default: () => [],
		},
		descriptionLabel: {
			type: String,
			default: null,
		},
		feature: {
			type: Feature,
			default: new Feature(),
		},
		initFeatureRating: {
			type: Number,
			default: null,
		},
		stars: {
			type: Number,
			default: 5,
		},
		visitor: {
			type: Boolean,
			default: false,
		},
		visitorCanRate: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			form: {
				name: this.getFeatureName(),
				category: this.feature.get('category') || '', // empty string is important for typeahead comp
				color: this.feature.get('color'),
				dash: this.feature.get('dash'),
				description: this.feature.get('description'),
				width: this.feature.get('width'),
			},
			rating: this.initFeatureRating,
			dashOptions: [
				{ text: 'Folytonos', value: '0' },
				{ text: 'Pontozott', value: '1,1' },
				{ text: 'Szaggatott', value: '2,1' },
				{ text: 'Hosszan szagg.', value: '4,1' },
				{ text: 'Pont-vonal', value: '1,1,3,1' },
			],
			editable: !this.visitor || this.feature.get('visitorFeature'),
			icons: {
				Point: 'fa-map-marker-alt',
				LineString: 'fa-route',
				Polygon: 'fa-draw-polygon',
			},
		};
	},
	computed: {
		...mapGetters({ getSelectedFeature: 'selected/getSelectedFeature' }),
		selectedFeature() {
			return this.getSelectedFeature === this.feature;
		},
		onEditMode() {
			return this.$store.getters.getEditState;
		},
	},
	watch: {
		'form.category'() {
			this.feature.set('category', this.form.category);
			this.$emit('categoryEdited');
		},
		'form.color'() {
			this.emitChangeStyle();
			// debounce maybe..
		},
		'form.dash'() {
			this.emitChangeStyle();
		},
		'form.name'() {
			this.feature.set('name', this.form.name);
		},
		'form.description'() {
			this.feature.set('description', this.form.description);
		},
		'form.width'() {
			this.emitChangeStyle();
		},
		rating(rating) {
			this.$nuxt.$emit('featureRatedByVisitor', this.feature.getId(), rating);
		},
		form: {
			handler(val) {
				this.$nuxt.$emit('contentModified');
			},
			deep: true,
		},
	},
	mounted() {
		// notify feature list to initialize category tags/autocomplete
		this.$emit('categoryEdited');

		// When an element is created, scroll to it
		if (this.selectedFeature) {
			this.expandFinished();
		}
	},
	methods: {
		emitChangeStyle() {
			this.$nuxt.$emit(
				'changeStyle',
				this.feature,
				this.form.color,
				this.form.dash,
				this.form.width
			);
		},
		getFeatureName() {
			const anon = {
				Point: 'Pont',
				LineString: 'Útvonal',
				Polygon: 'Terület',
			}[this.feature.getGeometry().getType()];
			return this.feature.get('name') || anon;
		},
		featureClicked() {
			this.selectedFeature
				? this.$store.commit('selected/remove', this.feature)
				: this.$store.commit('selected/change', this.feature);
		},
		async deleteFeature() {
			const confirmed = await this.confirmDeletion(
				this.form.name || this.feature.id
			);
			if (confirmed) {
				this.$nuxt.$emit('clearFeature', this.feature);
			}
		},
		expandFinished() {
			// custom scrollIntoView as its more accurate:
			const t = this.$refs.feature.offsetTop;
			document.getElementsByClassName('b-sidebar-body')[0].scrollTop = t - 75;

			if (this.$refs.description) {
				this.$refs.description.focus();
			}
		},
	},
};
</script>

<style scoped>
.highlight {
	box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5), 0 0 0 10000px rgba(0, 0, 0, 0.5);
	z-index: 9999;
}

.list-group-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem 1rem;
	border-left: 5px solid transparent;
}
.selected > span:first-child {
	font-weight: bold;
}
.collapse-content {
	border-top: none;
	border-radius: 0 0 0.25rem 0.25rem;
}
.card-body {
	padding: 1rem;
}

.char-count {
	position: absolute;
	margin-top: 2px;
	font-size: 60%;
}
</style>
