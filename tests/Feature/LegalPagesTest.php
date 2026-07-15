<?php

use Inertia\Testing\AssertableInertia as Assert;

test('home page exposes current public plan prices', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('site/home/index')
            ->where('plans.0.periods.0.price', '39.90')
            ->where('plans.0.periods.1.price', '239.40')
            ->where('plans.0.periods.2.price', '383.04')
            ->where('plans.1.periods.0.price', '139.90')
            ->where('plans.1.periods.1.price', '755.46')
            ->where('plans.1.periods.2.price', '1343.04'));
});

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
