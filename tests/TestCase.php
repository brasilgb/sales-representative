<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = parent::createApplication();
        $connection = $app['config']->get('database.default');
        $database = $app['config']->get("database.connections.{$connection}.database");

        if ($app->environment('testing') && ! str_ends_with((string) $database, '_testing')) {
            throw new RuntimeException('A suíte de testes só pode usar um banco cujo nome termine em _testing.');
        }

        return $app;
    }
}
