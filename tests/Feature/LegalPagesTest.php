<?php

use Inertia\Testing\AssertableInertia as Assert;

test('terms of use page is public', function () {
    $this->get(route('terms'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('site/terms/index'));
});

test('privacy policy page is public', function () {
    $this->get(route('privacy'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('site/privacy/index'));
});
