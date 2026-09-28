<?php

it('responds on the health endpoint', function () {
    $this->get('/up')->assertOk();
});

it('redirects the root to the admin panel', function () {
    $this->get('/')->assertRedirect('/admin');
});
