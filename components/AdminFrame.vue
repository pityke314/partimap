<template>
	<div>
		<b-navbar
			fixed="top"
			toggleable="lg"
			type="light"
			variant="white"
			class="border-bottom shadow-sm"
		>
			<b-navbar-brand to="/admin">
				<Logo />
			</b-navbar-brand>
			<b-navbar-toggle target="nav-collapse" />
			<b-collapse
				id="nav-collapse"
				is-nav
			>
				<b-navbar-nav>
					<b-nav-item to="/admin/projects">Projektek</b-nav-item>
					<b-nav-item to="/admin/maps">Térképek</b-nav-item>
					<b-nav-item
						v-if="$auth.user.isAdmin"
						to="/admin/users"
					>
						Felhasználók
					</b-nav-item>
				</b-navbar-nav>
				<b-navbar-nav class="ml-auto">
					<b-nav-item to="/admin/help">Súgó</b-nav-item>
					<b-nav-item-dropdown
						:text="$auth.user.name"
						right
					>
						<b-dropdown-item :to="'/admin/user/' + $auth.user.id">Adataim</b-dropdown-item>
						<b-dropdown-item @click="$auth.logout('cookie')">Kijelentkezés</b-dropdown-item>
					</b-nav-item-dropdown>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>

		<div class="container mt-5 pt-5">
			<div class="card mb-5 shadow-sm">
				<h2
					v-if="$slots.header"
					class="card-header"
				>
					<slot name="header" />
				</h2>
				<div
					v-if="$slots.default"
					class="card-body"
				>
					<slot />
				</div>
				<div
					v-if="$slots.footer"
					class="card-footer"
				>
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
</template>
