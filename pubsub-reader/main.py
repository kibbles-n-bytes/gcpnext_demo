# -*- coding: utf-8 -*-
"""Pub/Sub pull example on Google Kubernetes Engine.

This program pulls messages from a Cloud Pub/Sub topic and
prints to standard output.
"""

import datetime
import os
import threading

from google.cloud import pubsub

PUBSUB_TOPIC_1 = os.environ['PUBSUB_TOPIC_1']
PUBSUB_SUBSCRIPTION_1 = os.environ['PUBSUB_SUBSCRIPTION_1']
PUBSUB_TOPIC_2 = os.environ['PUBSUB_TOPIC_2']
PUBSUB_SUBSCRIPTION_2 = os.environ['PUBSUB_SUBSCRIPTION_2']


def worker(t, s):
  """Continuously pull messages from subsciption"""
  client = pubsub.Client()
  subscription = client.topic(t).subscription(s)

  print('Pulling messages from Pub/Sub: {0}/{1}...'.format(t, s))
  while True:
    with pubsub.subscription.AutoAck(subscription, max_messages=10) as ack:
      for _, message in list(ack.items()):
        print("[{}] {}/{}: {}: \"{}\"".format(datetime.datetime.now(),
                                            t,
                                            s,
                                            message.message_id,
                                            message.data.decode("utf-8")))


def main():
  t1 = threading.Thread(target=worker, args=(PUBSUB_TOPIC_1, PUBSUB_SUBSCRIPTION_1,))
  t2 = threading.Thread(target=worker, args=(PUBSUB_TOPIC_2, PUBSUB_SUBSCRIPTION_2,))
  t1.start()
  t2.start()

if __name__ == '__main__':
  main()
