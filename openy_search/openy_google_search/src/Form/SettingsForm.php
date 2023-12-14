<?php

namespace Drupal\openy_google_search\Form;

use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Settings Form for openy_google_search.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * The cache tags invalidator.
   *
   * @var \Drupal\Core\Cache\CacheTagsInvalidatorInterface
   */
  protected $cacheTagsInvalidator;

  /**
   * Constructs a \Drupal\openy_google_search\Form\SettingsForm object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\Core\Cache\CacheTagsInvalidatorInterface $cache_tags_invalidator
   *   The cache tag invalidator.
   */
  public function __construct(ConfigFactoryInterface $config_factory, CacheTagsInvalidatorInterface $cache_tags_invalidator) {
    $this->setConfigFactory($config_factory);
    $this->cacheTagsInvalidator = $cache_tags_invalidator;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('cache_tags.invalidator')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'openy_google_search_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'openy_google_search.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('openy_google_search.settings');

    $form['google_engine_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google Search Engine ID'),
      '#description' => $this->t('Go to the <a href="https://programmablesearchengine.google.com/controlpanel/all" target="_blank">Google Control Panel</a> then copy the ID from the search engine overview.'),
      '#size' => 40,
      '#default_value' => !empty($config->get('google_engine_id')) ? $config->get('google_engine_id') : '',
      '#required' => TRUE,
    ];

    $form['search_page_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search page ID'),
      '#description' => $this->t('Find the node id of the search results page by editing the page and looking in the URL for <code>/node/{node_id}/edit</code>'),
      '#size' => 40,
      '#default_value' => !empty($config->get('search_page_id')) ? $config->get('search_page_id') : '',
      '#required' => TRUE,
    ];

    $form['search_query_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search query key'),
      '#description' => $this->t('The argument preceding the search string in the URL. For example, in <code>/search?q=swim</code>, the query key is <code>q</code>. Google does not allow configuring this value.'),
      '#size' => 40,
      '#default_value' => !empty($config->get('search_query_key')) ? $config->get('search_query_key') : '',
      '#required' => TRUE,
      '#disabled' => 'disabled',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $search_page_id = $form_state->getValue('search_page_id');

    // Set an error if the page id is not a number.
    if (!is_numeric($search_page_id)) {
      $form_state
        ->setErrorByName('search_page_id', $this
          ->t('The Search page ID must be a number.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $config = $this->config('openy_google_search.settings');
    $config->set('google_engine_id', $values['google_engine_id']);
    $config->set('search_page_id', $values['search_page_id']);
    $config->set('search_query_key', $values['search_query_key']);
    $config->save();

    $this->cacheTagsInvalidator->invalidateTags($config->getCacheTags());

    parent::submitForm($form, $form_state);
  }

}
