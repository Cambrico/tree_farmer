<?php

namespace Drupal\nfafmis\EventSubscriber;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Redirects anonymous users to the login page.
 */
class FrontEventSubscriber implements EventSubscriberInterface {

  /**
   * Redirect anonymous users to login page.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The RequestEvent to process.
   */
  public function redirect(RequestEvent $event) {

    global $base_url;

    if (
      \Drupal::currentUser()->isAnonymous() &&
      \Drupal::routeMatch()->getRouteName() != 'user.login' &&
      \Drupal::routeMatch()->getRouteName() != 'user.reset' &&
      \Drupal::routeMatch()->getRouteName() != 'user.reset.form' &&
      \Drupal::routeMatch()->getRouteName() != 'user.reset.login' &&
      \Drupal::routeMatch()->getRouteName() != 'user.pass' ) {
      $response = new RedirectResponse($base_url . '/user/login', 301);
      $response->send();
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = ['redirect'];
    return $events;
  }

}
