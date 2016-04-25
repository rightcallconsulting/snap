from operator import itemgetter
from IPython import embed

def add_plays_to_counts_dict(counts_dict, plays):
    """Helper function to add a list of Play objects to a dictionary of Play
    frequency counts where the key is the play object and the value is the
    number of occurances."""

    for play in plays:
        if play in counts_dict:
            counts_dict[play] += 1
        else:
            counts_dict[play] = 1


class PlayerAnalytics:
    """Helper class to calculate analytics metrics for a group of players.

    Attributes:
        players: The list of the players we are calculating analytics for.
        total_time: An integer count of the total time, in seconds, that the
            players have spent doing tests.
        correct_plays: A sorted list of (<Play obj>, count) tuples, with count
            representing the number of times a question about that play was
            answered correctly.
        incorrect_plays: A sorted list of (<Play obj>, count) tuples, for plays
            that were answered incorrectly.
        skipped_plays: A sorted list of (<Play obj>, count) tuples, for plays
            that were skipped.
    """

    def __init__(self, players):
        """Inits with a list of Player objects."""
        self.players = players
        self.plays = dict()
        self.total_time = 0.0
        correct_plays_dict = {}
        incorrect_plays_dict = {}
        skipped_plays_dict = {}

        # Sum calculations across every TestResult for every Player in players
        for player in players:
            for result in player.testresult_set.all():
                if result.time_taken: self.total_time += result.time_taken

                add_plays_to_counts_dict(
                    plays=result.correct_plays.all(),
                    counts_dict=correct_plays_dict
                )
                add_plays_to_counts_dict(
                    plays=result.missed_plays.all(),
                    counts_dict=incorrect_plays_dict
                )
                add_plays_to_counts_dict(
                    plays=result.skipped_plays.all(),
                    counts_dict=skipped_plays_dict,
                )

        # Convert play count dictionaries into list of sorted tuples:
        # {<Play 1>: 4, <Play 2>: 10} --> [(<Play 2>, 10), (<Play 1>, 4)]
        self.correct_plays = sorted(correct_plays_dict.iteritems(),
            key=itemgetter(1), reverse=True)
        self.incorrect_plays = sorted(incorrect_plays_dict.iteritems(),
            key=itemgetter(1), reverse=True)
        self.skipped_plays = sorted(skipped_plays_dict.iteritems(),
            key=itemgetter(1), reverse=True)

        self.correct_plays_percent = sorted(self.get_percentage_tuple_list(
            self.correct_plays), key=itemgetter(1), reverse=True)
        self.incorrect_plays_percent = sorted(self.get_percentage_tuple_list(
            self.incorrect_plays), key=itemgetter(1), reverse=True)
        self.skipped_plays_percent = sorted(self.get_percentage_tuple_list(
            self.skipped_plays), key=itemgetter(1), reverse=True)

    @classmethod
    def for_single_player(cls, player):
        return cls([player])

    @classmethod
    def for_players(cls, player_iterable):
        return cls(player_iterable)

    # Play Analytics:

    # Aggregate:

    def avg_time_per_question(self):
        """Returns the average time spent per question over all of the test
        results of the player group."""
        total_plays = self.total_plays()
        return self.total_time / total_plays if total_plays > 0 else 0

    def total_correct_plays(self):
        return len(self.correct_plays)

    def total_incorrect_plays(self):
        return len(self.incorrect_plays)

    def total_skipped_plays(self):
        return len(self.skipped_plays)

    def total_plays(self):
        """Returns the total # of questions the players have been asked."""
        return self.total_correct_plays() + self.total_incorrect_plays() + \
            self.total_skipped_plays()

    def total_correct_plays_percentage(self):
        total_plays = self.total_plays()
        if total_plays == 0: return 0
        return round(100.0 * self.total_correct_plays() / total_plays)

    def total_incorrect_plays_percentage(self):
        total_plays = self.total_plays()
        if total_plays == 0: return 0
        return round(100.0 * self.total_incorrect_plays() / total_plays)

    def total_skipped_plays_percentage(self):
        total_plays = self.total_plays()
        if total_plays == 0: return 0
        return round(100.0 * self.total_skipped_plays() / total_plays)

    # Specific Play:

    def total_correct_for_play(self, play):
        """The number of times the player/group has answered questions about 
        the play correctly."""
        for p, count in self.correct_plays:
            if p == play: return count
        return 0

    def total_incorrect_for_play(self, play):
        """The number of times the player/group has answered questions about 
        the play incorrectly."""
        for p, count in self.incorrect_plays:
            if p == play: return count
        return 0

    def total_skipped_for_play(self, play):
        """The number of times the player/group has skipped questions about 
        the play."""
        for p, count in self.skipped_plays:
            if p == play: return count
        return 0

    def total_questions_for_play(self, play):
        """The number of times the player/group has been asked questions about
        the play."""
        return self.total_correct_for_play(play) + \
            self.total_incorrect_for_play(play) + \
            self.total_skipped_for_play(play)

    def correct_percentage_for_play(self, play):
        """Percentage answers the player/group gave about the play that were 
        correct."""
        total_qs = self.total_questions_for_play(play)
        if total_qs == 0: return 0
        return round(100.0 * self.total_correct_for_play(play) / total_qs)

    def incorrect_percentage_for_play(self, play):
        """Percentage answers the player/group gave about the play that were 
        incorrect."""
        total_qs = self.total_questions_for_play(play)
        if total_qs == 0: return 0
        return round(100.0 * self.total_incorrect_for_play(play) / total_qs)

    def skipped_percentage_for_play(self, play):
        """Percentage skips the player/group took when asked about the play."""
        total_qs = self.total_questions_for_play(play)
        if total_qs == 0: return 0
        return round(100.0 * self.total_skipped_for_play(play) / total_qs)

    # Formation Analytics:

    # Specific Formation:

    def total_correct_for_formation(self, formation):
        """The number of times the player/group has answered questions about 
        the formation CORRECTLY."""
        total = 0
        for p, count in self.correct_plays:
            if p.formation == formation: total += count
        return total

    def total_incorrect_for_formation(self, formation):
        """The number of times the player/group has answered questions about 
        the formation INCORRECTLY."""
        total = 0
        for p, count in self.incorrect_plays:
            if p.formation == formation: total += count
        return total

    def total_skipped_for_formation(self, formation):
        """The number of times the player/group has SKIPPED questions about 
        the formation."""
        total = 0
        for p, count in self.skipped_plays:
            if p.formation == formation: total += count
        return total

    def total_questions_for_formation(self, formation):
        """The number of times the player/group has been asked questions about
        the formation."""
        return self.total_correct_for_formation(formation) + \
            self.total_incorrect_for_formation(formation) + \
            self.total_skipped_for_formation(formation)

    def correct_percentage_for_formation(self, formation):
        """Percentage answers the player/group gave about the formation that
        were correct."""
        total_qs = self.total_questions_for_formation(formation)
        if total_qs == 0: return 0
        return round(
            100.0 * self.total_correct_for_formation(formation) / total_qs
        )

    def incorrect_percentage_for_formation(self, formation):
        """Percentage answers the player/group gave about the formation that
        were incorrect."""
        total_qs = self.total_questions_for_formation(formation)
        if total_qs == 0: return 0
        return round(
            100.0 * self.total_incorrect_for_formation(formation) / total_qs
        )

    def skipped_percentage_for_formation(self, formation):
        """Percentage skips the player/group took when asked about the
        formation."""
        total_qs = self.total_questions_for_formation(formation)
        if total_qs == 0: return 0
        return round(
            100.0 * self.total_skipped_for_formation(formation) / total_qs
        )

    # Helpers:

    def get_percentage_tuple_list(self, totalList):
        toReturn = []
        for play, count in totalList:
            t = (play, int(100.0 * count / self.total_questions_for_play(play)))
            toReturn.append(t)
        return toReturn
