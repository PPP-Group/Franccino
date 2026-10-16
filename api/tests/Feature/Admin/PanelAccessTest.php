<?php

use App\Models\User;

it('lets active admins and editors into the panel', function (string $state) {
    $user = User::factory()->{$state}()->create();

    $this->actingAs($user)->get('/admin')->assertOk();
})->with(['admin', 'editor']);

it('blocks inactive users', function () {
    $user = User::factory()->admin()->inactive()->create();

    $this->actingAs($user)->get('/admin')->assertForbidden();
});

it('redirects guests to the login page', function () {
    $this->get('/admin')->assertRedirect('/admin/login');
});

it('labels the menu in portuguese, with the catalog entities together', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get('/admin')
        ->assertOk()
        ->assertSeeInOrder(['Catálogo', 'Produtos', 'Coleções', 'Lançamentos', 'Designers', 'Categorias', 'Conteúdo', 'Banners', 'Páginas'])
        ->assertDontSee('Finish Groups')
        ->assertDontSee('Consentimentos De Cookies');
});
