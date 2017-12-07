# -*- coding: utf-8 -*-
"""Pub/Sub pull example on Google Kubernetes Engine.

This program pulls messages from a Cloud Pub/Sub topic and
prints to standard output.
"""

import datetime
import threading
import sys

from google.cloud import pubsub


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
  args = sys.argv[1].strip(' ').split(' ')
  for i in range(0, len(args), 2):
    topic = args[i]
    subscription = args[i+1]
    t = threading.Thread(target=worker, args=(topic, subscription,))
    t.start()

if __name__ == '__main__':
  main()
